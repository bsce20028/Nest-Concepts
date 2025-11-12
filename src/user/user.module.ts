import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [UserService, SupabaseService, ConfigService],
  controllers: [UserController],
})
export class UserModule {}
