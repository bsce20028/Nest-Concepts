/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { SupabaseModule } from './supabase/supabase.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UserRolesController } from './user-roles/user-roles.controller';
import { TokenRefreshMiddleware } from './auth/middleware/token-refresh.middleware';
import { CookieConfig } from './config/cookie.config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UserModule,
    TaskModule,
    SupabaseModule,
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