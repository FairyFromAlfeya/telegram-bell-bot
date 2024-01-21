import * as Realm from 'realm';

export class Channel extends Realm.Object<Channel> {
  _id!: string;
  title!: string;
  description?: string;
  customUrl!: string;
  logo!: string;
  lastChecked!: string;

  static schema: Realm.ObjectSchema = {
    name: 'Channel',
    properties: {
      _id: 'string',
      title: 'string',
      description: 'string?',
      customUrl: 'string',
      logo: 'string',
      lastChecked: 'string',
    },
    primaryKey: '_id',
  };
}
