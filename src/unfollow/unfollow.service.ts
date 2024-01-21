import { Service } from 'nestgram';
import * as Realm from 'realm';

import { Follow } from '../realm/follow.model';

@Service()
export class UnfollowService {
  constructor(private readonly realm: Realm) {}

  getChannelsList(user: number): Realm.Results<Follow> {
    return this.realm
      .objects(Follow)
      .filtered(`user = '${user}'`)
      .sorted('channel.title');
  }

  unfollowFrom(user: number, id: string): void {
    const follow = this.realm.objectForPrimaryKey(
      Follow,
      new Realm.BSON.ObjectId(id),
    );

    const follows = this.realm
      .objects(Follow)
      .filtered('channel._id == $0', follow.channel._id);

    const last = follows.length === 1 ? follows[0].channel : null;

    this.realm.write(() => {
      if (follow.user === user) {
        console.log('Unfollowed');
        this.realm.delete(follow);
      }

      if (last) {
        console.log('Unsub from channel');
        this.realm.delete(last);
      }
    });
  }
}
