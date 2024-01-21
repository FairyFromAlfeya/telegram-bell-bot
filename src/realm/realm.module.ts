import * as Realm from 'realm';

import { Channel } from './channel.model';
import { Follow } from './follow.model';

const realm = Realm.open({ schema: [Channel, Follow], path: 'db/db' });

export const UseRealmConnection = () => (): Promise<Realm[]> =>
  realm.then((realm) => [realm]);
