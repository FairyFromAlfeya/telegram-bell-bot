import { Module } from 'nestgram';

import { WorkerService } from './worker.service';
import { UseRealmConnection } from '../realm/realm.module';
import { WorkerController } from './worker.controller';

@Module({
  modules: [UseRealmConnection()],
  services: [WorkerService],
  controllers: [WorkerController],
})
export class WorkerModule {}
