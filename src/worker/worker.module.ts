import { Module } from 'nestgram';

import { WorkerService } from './worker.service';
import { UseRealmConnection } from '../realm/realm.module';

@Module({
  modules: [UseRealmConnection()],
  services: [WorkerService],
})
export class WorkerModule {}
