import { utilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  level: 'verbose',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp'],
        }),
      ),
    }),
    new winston.transports.File({
      level: 'verbose',
      filename: 'application.log',
      dirname: 'logs',
    }),
  ],
};
