/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class supabaseHelper {
  constructor(private supabaseService: SupabaseService) {}

  async createUser(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signUp({
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
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);
    if (!data.user || !data.session) {
      throw new Error('Authentication failed');
    }

    const { data: latestOtp, error: otpError } = await this.supabaseService
      .getClient()
      .from('user_otps')
      .select('*')
      .eq('user_id', data.user.id)
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !latestOtp?.verified) {
      throw new Error('Please Verify OTP , sent to your email address');
    }

    return data;
  }

  async getAllUsers() {
    const { data } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*');
    return data;
  }
}
