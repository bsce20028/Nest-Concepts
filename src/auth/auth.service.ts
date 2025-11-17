/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { supabaseHelper } from './helper-service/supabase.helper';
import { OtpHelper } from './helper-service/otp.helper';

@Injectable()
export class AuthService {
  constructor(
    private supabaseHelper: supabaseHelper,
    private otpHelper: OtpHelper,
  ) {}

  async register(email: string, password: string, username: string) {
    try {
      const user = await this.supabaseHelper.createUser(
        email,
        password,
        username,
      );

      if (!user) {
        throw new ConflictException('Registration failed');
      }
      await this.otpHelper.sendOtp(user.id ?? '', email);

      return {
        message: 'User registered successfully. OTP sent to email.',
        user: { id: user.id ?? '', email: user.email, username: user.username },
      };
    } catch (error) {
      throw new ConflictException(error.message || 'Registration failed');
    }
  }

  async verifyOtp(userId: string, otp: string) {
    return this.otpHelper.verifyOtp(userId, otp);
  }

  async login(email: string, password: string) {
    try {
      const authResult = await this.supabaseHelper.loginUser(email, password);

      return {
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          username: authResult.user.user_metadata?.username,
          role: authResult.user.user_metadata?.role || 'user',
        },
        access_token: authResult.session.access_token,
        refresh_token: authResult.session.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Login failed');
    }
  }

  async forgotPassword(email: string) {
    try {
      const userId = await this.supabaseHelper.getUserIdByEmail(email);

      if (!userId) {
        throw new UnauthorizedException('User not found');
      }

      await this.otpHelper.sendPasswordResetOtp(userId, email);

      return {
        message: 'Password reset OTP sent to your email.',
        userId,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to send OTP');
    }
  }

  async resetPassword(userId: string, newPassword: string) {
    try {
      const hasVerifiedOtp = await this.otpHelper.checkVerifiedOtp(userId);

      if (!hasVerifiedOtp) {
        throw new UnauthorizedException('Please verify OTP first');
      }

      await this.supabaseHelper.updateUserPassword(userId, newPassword);

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Password reset failed');
    }
  }
  async verifyToken(token: string) {
    return await this.supabaseHelper.verifyToken(token);
  }
  async refreshTokens(refreshToken: string) {
    try {
      const refreshResult =
        await this.supabaseHelper.refreshSession(refreshToken);

      if (!refreshResult.session || !refreshResult.user) {
        throw new UnauthorizedException(
          'Session is invalid or expired. Please login again.',
        );
      }

      const isValidToken = await this.supabaseHelper.validateRefreshToken(
        refreshResult.user.id,
        refreshToken,
      );

      if (!isValidToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        access_token: refreshResult.session.access_token,
        refresh_token: refreshResult.session.refresh_token,
        user: {
          id: refreshResult.user.id,
          email: refreshResult.user.email,
          username: refreshResult.user.user_metadata?.username,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed', error);
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.supabaseHelper.updateRefreshToken(userId, refreshToken);
  }
}
