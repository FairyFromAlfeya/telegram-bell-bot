import {
  Service,
  MessageSend,
  Keyboard,
  KeyboardTypes,
  IEntity,
  Answer,
} from 'nestgram';

@Service()
export class AppService {
  getChatButtons(): MessageSend {
    return new MessageSend(
      'Keyboard',
      new Keyboard(KeyboardTypes.underTheChat, 'Choose command')
        .text('Add channel (/add_channel)')
        .text('Remove channel (/remove_channel)'),
    );
  }

  async setScope(text: string, entity: IEntity, answer: Answer): Promise<void> {
    const command = text.slice(
      entity.offset + 1,
      entity.offset + entity.length,
    );

    if (command === 'add_channel') {
      await answer.scope('follow');
    }

    if (command === 'remove_channel') {
      await answer.scope('unfollow');
    }
  }
}
