import { Module } from 'nestgram';

import { UnfollowScope } from './unfollow.scope';
import { UnfollowService } from './unfollow.service';
import { UseRealmConnection } from '../realm/realm.module';

@Module({
  modules: [UseRealmConnection()],
  scopes: [UnfollowScope],
  services: [UnfollowService],
})
export class UnfollowModule {}
