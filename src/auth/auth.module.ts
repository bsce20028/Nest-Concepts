/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { supabaseHelper } from './helper-service/supabase.helper';
import { OtpHelper } from './helper-service/otp.helper';
import { HashService } from './helper-service/hash.service';

@Module({
  providers: [AuthService, SupabaseService, supabaseHelper, OtpHelper, HashService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
