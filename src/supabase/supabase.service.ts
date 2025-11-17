/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

@Injectable()
export class SupabaseService {
  public supabase: SupabaseClient<Database>;
  public AuthSupabase: SupabaseClient<Database>;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
      this.logger.error(
        'SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_ANON_KEY are required in the environment variables.',
      );
      throw new Error('Missing required Supabase environment variables');
    }
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.AuthSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,    
        persistSession: false,        
        detectSessionInUrl: false
      }
    });
  }
}