import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { typeOrmConfig } from './configs/typeorm.config';
import { winstonConfig } from './configs/winston.config';
import { mailerConfig } from './configs/mailer.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    WinstonModule.forRoot(winstonConfig),
    MailerModule.forRoot(mailerConfig),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
