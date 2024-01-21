import { Controller, Delete, OnClick } from 'nestgram';

@Controller()
export class WorkerController {
  constructor() {}

  @OnClick('hide')
  onHideNotification(): Delete {
    return new Delete();
  }
}
