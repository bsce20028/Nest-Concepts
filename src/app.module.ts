/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SupabaseModule } from './supabase/supabase.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UserRolesController } from './user-roles/user-roles.controller';
import { TokenRefreshMiddleware } from './auth/middleware/token-refresh.middleware';
import { CookieConfig } from './config/cookie.config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { IncidentsModule } from './incidents/incidents.module';
import { MulterModule } from '@nestjs/platform-express';
import { ReportingModule } from './reporting/reporting.module';
import { WatcherModule } from './watcher/watcher.module';
import { ActivitylogModule } from './activitylog/activitylog.module';
import { EmailModule } from './email/email.module';
import * as multer from 'multer';
import { LoggerMiddleware } from './middleware/logger.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      storage: multer.memoryStorage(),          
      limits: {
        fileSize: 10 * 1024 * 1024,              
        files: 5,                                
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
      },
    }),

    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UserModule,
    SupabaseModule,
    IncidentsModule,
    ReportingModule,
    WatcherModule,
    ActivitylogModule,
    EmailModule,
  ],
  controllers: [AppController, UserRolesController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer
      .apply(TokenRefreshMiddleware)
      .exclude(
        ...CookieConfig.SKIP_ROUTES.map(path => ({ 
          path: path.replace(/^\//, ''),
          method: RequestMethod.ALL 
        }))
      )
      .forRoutes('*');
  }
}