import { Service, Api, Keyboard, KeyboardTypes } from 'nestgram';
import * as Realm from 'realm';
import { Notification } from '@daangamesdg/youtube-notifications';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifier = require('@daangamesdg/youtube-notifications');

import { Channel } from '../realm/channel.model';
import { Follow } from '../realm/follow.model';

@Service()
export class WorkerService {
  notifier = new Notifier({
    hubCallback: process.env.HUB_CALLBACK,
    path: process.env.HUB_CALLBACK_PATH,
    port: process.env.HUB_CALLBACK_PORT,
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

  resubAll(): void {
    const channels = this.realm.objects(Channel);

    console.log(
      `Added to subscription: ${JSON.stringify(channels.map((r) => r._id))}`,
    );

    if (this.subedChannels) {
      this.notifier.unsubscribe(this.subedChannels);
    }

    this.notifier.subscribe(channels.map((r) => r._id));
    this.subedChannels = channels.map((r) => r._id);
  }

  async sendNotification(notification: Notification): Promise<void> {
    if (notification.updated.getTime() <= notification.published.getTime()) {
      console.log(`New video: ${notification.video.id}`);

      const followers = this.realm
        .objects(Follow)
        .filtered(`channel = '${notification.channel.id}'`);

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
