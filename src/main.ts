import 'dotenv/config';

import { NestGram, WebhookPorts } from 'nestgram';
import { AppModule } from './app.module';

new NestGram(
  process.env.TELEGRAM_TOKEN,
  AppModule,
  {
    url: process.env.TELEGRAM_WEBHOOK,
    port: +process.env.TELEGRAM_WEBHOOK_PORT as WebhookPorts,
  },
  {
    runType: 'webhook',
    fileLogging: false,
    logging: false,
  },
).start();
