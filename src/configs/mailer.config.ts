import { resolve } from 'path';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  template: {
    dir: resolve(__dirname, '..', '..', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      extname: '.hbs',
      layoutDir: resolve(__dirname, '..', '..', 'templates'),
    },
  },
  transport: `smtps://lucasroliveira98@gmail.com:0l1v31r4@smtp.gmail.com`,
};
