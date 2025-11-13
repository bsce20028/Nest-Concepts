/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
@Injectable()
export class supabaseHelper {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async createUser(email: string, password: string, username: string) {
    const { data: authData, error: authError } =
      await this.supabaseService.AuthSupabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

    if (authError) throw new Error(authError.message);

    return {
      id: authData.user?.id,
      email: authData.user?.email,
      username: authData.user?.user_metadata?.username,
      role: 'user',
      email_verified: false,
    };
  }
  async loginUser(email: string, password: string) {
    const { data, error } =
      await this.supabaseService.AuthSupabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw new Error(error.message);
    if (!data.user || !data.session) {
      throw new Error('Authentication failed');
    }

    const { data: latestOtp, error: otpError } =
      await this.supabaseService.supabase
        .from('user_otps')
        .select('*')
        .eq('user_id', data.user.id)
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

    if (otpError || !latestOtp?.verified) {
      throw new Error('Please Verify OTP , sent to your email address');
    }

    const expiresMs =
      this.configService.get<number>('refreshToken.expiresMs') ||
      parseInt(process.env.REFRESH_TOKEN_EXPIRY || '2592000000');

    const expiresAt = new Date(Date.now() + expiresMs);
    const { error: insertError } = await this.supabaseService.supabase
      .from('refresh_tokens')
      .insert({
        user_id: data.user.id,
        refresh_token: data.session.refresh_token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) throw new Error(insertError.message);

    return {
      user: data.user,
      session: data.session,
    };
  }
  async getAllUsers() {
    const { data } = await this.supabaseService.supabase
      .from('users')
      .select('*');
    return data;
  }

  async getUserIdByEmail(email: string): Promise<string | null> {
    const { data, error } =
      await this.supabaseService.supabase.auth.admin.listUsers();

    if (error) throw new Error(error.message);

    const user = data.users.find((u) => u.email === email);
    return user?.id || null;
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const { error } =
      await this.supabaseService.supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (error) throw new Error(error.message);

    return { message: 'Password updated successfully' };
  }
}
