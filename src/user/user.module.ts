import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import { supabaseHelper } from 'src/auth/helper-service/supabase.helper';
import { HashService } from 'src/auth/helper-service/hash.service';

@Module({
  providers: [
    UserService,
    SupabaseService,
    ConfigService,
    supabaseHelper,
    HashService,
  ],
  controllers: [UserController],
})
export class UserModule {}
