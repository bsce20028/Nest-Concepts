/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { HashService } from './hash.service';

@Injectable()
export class supabaseHelper {
  constructor(
    private supabaseService: SupabaseService,
    private hashService: HashService,
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

    await this.deleteExistingRefreshTokens(data.user.id);

    const hashedToken = await this.hashService.hash(data.session.refresh_token);

    const { error: insertError } = await this.supabaseService.supabase
      .from('refresh_tokens')
      .insert({
        user_id: data.user.id,
        refresh_token: hashedToken,
      });

    if (insertError) throw new Error(insertError.message);

    return {
      user: data.user,
      session: data.session,
    };
  }

  private async deleteExistingRefreshTokens(userId: string) {
    const { error } = await this.supabaseService.supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    if (error)
      throw new Error(`Failed to clean existing tokens: ${error.message}`);
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

  async verifyToken(token: string) {
    return await this.supabaseService.AuthSupabase.auth.getUser(token);
  }

  async refreshSession(refreshToken: string) {
    const { data, error } =
      await this.supabaseService.AuthSupabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (error || !data?.session) throw error || new Error('Refresh failed');

    return data;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.deleteExistingRefreshTokens(userId);

    const hashedToken = await this.hashService.hash(refreshToken);

    const { error } = await this.supabaseService.supabase
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        refresh_token: hashedToken,
      });

    if (error) {
      throw new Error('Failed to update refresh token');
    }
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.supabase
      .from('refresh_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return false;

    return await this.hashService.compare(refreshToken, data.refresh_token);
  }
}
