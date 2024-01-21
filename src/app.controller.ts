import {
  OnCommand,
  Controller,
  OnEntity,
  Entity,
  IEntity,
  Text,
  GetAnswer,
  Answer,
  MessageSend,
} from 'nestgram';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @OnCommand('start')
  onStart(): MessageSend {
    return this.appService.getChatButtons();
  }

  @OnEntity('bot_command')
  async onCommand(
    @Text() text: string,
    @Entity('bot_command') entity: IEntity,
    @GetAnswer() answer: Answer,
  ): Promise<void> {
    await this.appService.setScope(text, entity, answer);
  }
}
