/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    console.log('Supabase URL:', url);
    if (!url || !serviceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in configuration',
      );
    }
    this.supabase = createClient(url, serviceKey);
  }

  async createUser(email: string, password: string, username: string) {
    const { data, error } = await this.supabase
      .from('users')
      .insert({ email, password, username, role: 'user' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('User with this email or username already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async getUserByEmail(email: string) {
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return data;
  }

  async getAllUsers() {
    const { data } = await this.supabase.from('users').select('*');
    return data;
  }
}
