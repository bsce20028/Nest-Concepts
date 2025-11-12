/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
//import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { supabaseHelper } from './helper-service/supabase.helper';
import { OtpHelper } from './helper-service/otp.helper';

@Module({
  providers: [AuthService, SupabaseService, JwtService, supabaseHelper, OtpHelper],
  controllers: [AuthController],
})
export class AuthModule {}
