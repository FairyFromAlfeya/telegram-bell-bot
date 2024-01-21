import {
  Scope,
  OnEnter,
  Keyboard,
  KeyboardTypes,
  MessageSend,
  Chat,
  IChat,
  OnClick,
  Delete,
  GetAnswer,
  Answer,
  IUpdate,
} from 'nestgram';
import { UnfollowService } from './unfollow.service';

@Scope()
export class UnfollowScope {
  constructor(private readonly unfollowService: UnfollowService) {}

  @OnEnter()
  onScopeEnter(upd: IUpdate): MessageSend {
    const channels = this.unfollowService.getChannelsList(upd.message.chat.id);

    const keyboard = new Keyboard(KeyboardTypes.underTheMessage);

    for (const channel of channels) {
      keyboard.btn(channel.channel.title, `unfollow_${channel._id}`).row();
    }

    return new MessageSend(
      'Tap channel to unfollow',
      keyboard.btn('Skip', 'skip'),
    );
  }

  @OnClick(/unfollow_.+/)
  async onUnfollow(
    upd: IUpdate,
    @GetAnswer() answer: Answer,
    @Chat() chat: IChat,
  ): Promise<Delete> {
    this.unfollowService.unfollowFrom(
      chat.id,
      upd.callback_query.data.replace('unfollow_', ''),
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
