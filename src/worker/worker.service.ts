import { Service, Api, Keyboard, KeyboardTypes } from 'nestgram';
import * as Realm from 'realm';
import { Notification } from '@daangamesdg/youtube-notifications';
import { from, lastValueFrom, mergeMap } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifier = require('@daangamesdg/youtube-notifications');

import { Channel } from '../realm/channel.model';
import { Follow } from '../realm/follow.model';

const delay = (delayInms: number) =>
  new Promise((resolve) => setTimeout(resolve, delayInms));

@Service()
export class WorkerService {
  notifier = new Notifier({
    hubCallback: process.env.HUB_CALLBACK,
    path: process.env.HUB_CALLBACK_PATH,
    port: process.env.HUB_CALLBACK_PORT,
    secret: process.env.HUB_CALLBACK_SECRET,
  });

  api = new Api(process.env.TELEGRAM_TOKEN);

  subedChannels: string[];

  constructor(private readonly realm: Realm) {
    this.notifier.setup();

    this.notifier.on('notified', (data) => this.sendNotification(data));
    this.notifier.on('subscribe', (data) =>
      console.log(`Subed on: ${data.channel}`),
    );

    this.start();

    setInterval(() => this.resubAll(), +process.env.RESUB_INTERVAL);
  }

  start(): void {
    const channels = this.realm.objects(Channel);

    channels.addListener(
      (tasks: Realm.Collection<number>, changes: Realm.CollectionChangeSet) => {
        changes.deletions.forEach(() => {
          console.log('Resub');

          this.resubAll();
        });

        changes.insertions.forEach((index) => {
          console.log(`Added to subscription: ${tasks[index]._id}`);

          this.notifier.subscribe(tasks[index]._id);
          this.subedChannels.push(tasks[index]._id);
        });
      },
    );

    this.resubAll();
  }

  async resubAll(): Promise<void> {
    const channels = this.realm.objects(Channel);

    console.log(
      `Added to subscription: ${JSON.stringify(channels.map((r) => r._id))}`,
    );

    if (this.subedChannels) {
      await lastValueFrom(
        from(this.subedChannels).pipe(
          mergeMap(
            (c) =>
              delay(500)
                .then(() => this.notifier.unsubscribe(c))
                .then(() => c),
            1,
          ),
        ),
      );
    }

    await lastValueFrom(
      from(channels.slice(0)).pipe(
        mergeMap(
          (c) =>
            delay(500)
              .then(() => this.notifier.subscribe(c._id))
              .then(() => c._id),
          1,
        ),
      ),
    );

    this.subedChannels = channels.map((r) => r._id);
  }

  async sendNotification(notification: Notification): Promise<void> {
    const timeDiff = Math.abs(
      notification.updated.getTime() - notification.published.getTime(),
    );

    if (timeDiff < 1_800_000) {
      console.log(`New video: ${notification.video.id}`);

      const followers = this.realm
        .objects(Follow)
        .filtered('channel._id == $0', notification.channel.id);

      for (const follower of followers) {
        await this.api.send(
          follower.user,
          `https://www.youtube.com/watch?v=${notification.video.id}`,
          new Keyboard(KeyboardTypes.underTheMessage).btn('Hide', 'hide'),
        );
      }
    }
  }
}
