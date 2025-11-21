/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
// token-refresh.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';
import { CookieConfig } from '../../config/cookie.config';

@Injectable()
export class TokenRefreshMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  async use(req: Request, res: Response, next: NextFunction) {

    const accessToken = this.extractTokenFromHeader(req) || req.cookies?.[CookieConfig.ACCESS_TOKEN.name];
    const refreshToken = req.cookies?.[CookieConfig.REFRESH_TOKEN.name];

    if (!accessToken) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const {
        data: { user: verifiedUser },
        error,
      } = await this.authService.verifyToken(accessToken);

      const isTokenExpired =
        error &&
        (error.message.includes('token is expired') ||
          error.message.includes('expired'));

      if (isTokenExpired) {
        if (!refreshToken) {
          throw new UnauthorizedException(
            'Session expired, please login again',
          );
        }

        try {
          const newTokens = await this.authService.refreshTokens(refreshToken);

          await this.authService.updateRefreshToken(
            newTokens.user.id,
            newTokens.refresh_token,
          );
          res.setHeader('Authorization', `Bearer ${newTokens.access_token}`);
          res.cookie(
            CookieConfig.ACCESS_TOKEN.name,
            newTokens.access_token,
            CookieConfig.ACCESS_TOKEN.options,
          );
          res.cookie(
            CookieConfig.REFRESH_TOKEN.name,
            newTokens.refresh_token,
            CookieConfig.REFRESH_TOKEN.options,
          );
          req['user'] = newTokens.user;
          req['newAccessToken'] = newTokens.access_token;

          return next();
        } catch (refreshError) {
          throw new UnauthorizedException(
            'Unable to refresh session. Please login again.',
            refreshError,
          );
        }
      } else if (error) {
        throw new UnauthorizedException('Authentication failed');
      }

      if (verifiedUser) {
        req['user'] = {
          id: verifiedUser.id,
          email: verifiedUser.email,
          username: verifiedUser.user_metadata?.username,
        };
      }

      next();
    } catch (error) {
      throw new UnauthorizedException('Authentication failed', error);
    }
  }
}
