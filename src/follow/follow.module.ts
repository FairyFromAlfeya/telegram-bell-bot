import { Module } from 'nestgram';

import { FollowScope } from './follow.scope';
import { FollowService } from './follow.service';
import { UseRealmConnection } from '../realm/realm.module';

@Module({
  modules: [UseRealmConnection()],
  scopes: [FollowScope],
  services: [FollowService],
})
export class FollowModule {}
