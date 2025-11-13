/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
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
      const user = await this.supabaseHelper.createUser(email, password, username);

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

}
