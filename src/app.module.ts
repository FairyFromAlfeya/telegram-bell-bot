import { Module } from 'nestgram';

import { FollowModule } from './follow/follow.module';
import { WorkerModule } from './worker/worker.module';
import { UnfollowModule } from './unfollow/unfollow.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [FollowModule, WorkerModule, UnfollowModule],
  controllers: [AppController],
  services: [AppService],
})
export class AppModule {}
