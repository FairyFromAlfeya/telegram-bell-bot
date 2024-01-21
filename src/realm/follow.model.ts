import * as Realm from 'realm';

import { Channel } from './channel.model';

export class Follow extends Realm.Object<Follow> {
  _id!: Realm.BSON.ObjectId;
  user!: number;
  channel!: Channel;

  static schema: Realm.ObjectSchema = {
    name: 'Follow',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      user: 'int',
      channel: 'Channel',
    },
    primaryKey: '_id',
  };
}
