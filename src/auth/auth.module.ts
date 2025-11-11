/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
//import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthService,SupabaseService,JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
