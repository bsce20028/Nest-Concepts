import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import { winstonConfig } from 'src/config/winston.config';

const logger = winston.createLogger(winstonConfig);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;

    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      logger.info({
        message: 'Request Log',
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
      });

      if (statusCode >= 400) {
        logger.error({
          message: 'Error Log',
          method,
          url: originalUrl,
          statusCode,
          duration: `${duration}ms`,
        });
      }
    });

    next();
  }
}
