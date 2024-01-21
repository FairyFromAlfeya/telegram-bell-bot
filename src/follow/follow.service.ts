import { Service } from 'nestgram';
import { google, youtube_v3 } from 'googleapis';
import * as Realm from 'realm';

import { Channel } from '../realm/channel.model';
import { Follow } from '../realm/follow.model';

export interface IChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  logo: youtube_v3.Schema$Thumbnail;
  statistics: youtube_v3.Schema$ChannelStatistics;
}

@Service()
export class FollowService {
  client = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_TOKEN,
  });

  constructor(private readonly realm: Realm) {}

  addFollow(
    user: number,
    channelId: string,
    title: string,
    description: string,
    customUrl: string,
    logo: string,
  ): void {
    let channel = this.realm.objectForPrimaryKey(Channel, channelId);

    this.realm.write(() => {
      if (!channel) {
        channel = this.realm.create(Channel, {
          _id: channelId,
          title: title,
          description: description,
          customUrl: customUrl,
          logo: logo,
          lastChecked: new Date().toISOString(),
        });
      }

      this.realm.create(Follow, {
        channel: channel,
        user: user,
      });
    });
  }

  async getChannelInfo(url: string): Promise<IChannelInfo> {
    const html = await fetch(url).then((r) => r.text());
    const channelId = html.match(
      /<meta itemprop="identifier" content="(?<id>.+?)">/,
    );

    const info = await this.client.channels.list({
      id: [channelId.groups.id],
      part: ['snippet', 'statistics', 'id'],
    });

    return {
      id: info.data.items[0].id,
      title: info.data.items[0].snippet.title,
      description: info.data.items[0].snippet.description,
      customUrl: info.data.items[0].snippet.customUrl,
      logo: info.data.items[0].snippet.thumbnails.high,
      statistics: info.data.items[0].statistics,
    };
  }

  checkUserFollow(user: number, channel: string): boolean {
    return !!this.realm
      .objects(Follow)
      .find((follow) => follow.user === user && follow.channel._id === channel);
  }
}
