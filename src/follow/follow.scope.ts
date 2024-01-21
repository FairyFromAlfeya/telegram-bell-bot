import {
  Scope,
  OnText,
  OnClick,
  Keyboard,
  GetAnswer,
  MessageSend,
  KeyboardTypes,
  Answer,
  Text,
  OnEnter,
  Photo,
  GetState,
  Chat,
  IChat,
  Delete,
} from 'nestgram';
import { FollowService, IChannelInfo } from './follow.service';

export interface IFollowState {
  info: IChannelInfo;
}

@Scope()
export class FollowScope {
  @GetState() state: IFollowState;

  constructor(private readonly followService: FollowService) {}

  @OnEnter()
  onScopeEnter(): string {
    return 'Enter link\nExample: youtube.com/@channel_tag';
  }

  @OnText()
  async onLinkSend(
    @Text() link: string,
    @Chat() chat: IChat,
  ): Promise<MessageSend> {
    const isValidUrl = !!link.match(
      /^(https?:\/{2})?(w{3}.)?youtube.com\/@.+$/,
    );

    if (!isValidUrl) {
      return new MessageSend(
        'Link is not valid',
        new Keyboard(KeyboardTypes.underTheMessage).btn('Skip', 'skip'),
      );
    }

    const info = await this.followService.getChannelInfo(link);

    const isExists = this.followService.checkUserFollow(chat.id, info.id);

    if (isExists) {
      return new MessageSend('This channel is already followed');
    }

    this.state.info = info;

    return new MessageSend(
      new Photo('url', info.logo.url).setCaption(
        `Add this channel?\n\nTitle: ${info.title}(${info.customUrl})\nDescription: ${info.description}\n\nSubscribers: ${info.statistics.subscriberCount}\nVideos: ${info.statistics.videoCount}\nViews: ${info.statistics.viewCount}`,
      ),
      new Keyboard(KeyboardTypes.underTheMessage)
        .btn('Add', 'add')
        .btn('Skip', 'skip'),
    );
  }

  @OnClick('add')
  async onAdd(
    @GetAnswer() answer: Answer,
    @Chat() chat: IChat,
  ): Promise<Delete> {
    this.followService.addFollow(
      chat.id,
      this.state.info.id,
      this.state.info.title,
      this.state.info.description,
      this.state.info.customUrl,
      this.state.info.logo.url,
    );

    await answer.unscope();

    return new Delete();
  }

  @OnClick('skip')
  async onSkip(@GetAnswer() answer: Answer): Promise<Delete> {
    await answer.unscope();

    return new Delete();
  }
}
