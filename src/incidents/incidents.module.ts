import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { HashService } from 'src/auth/helper-service/hash.service';
import { supabaseHelper } from 'src/auth/helper-service/supabase.helper';
import { SupabaseService } from 'src/supabase/supabase.service';
import { AuthService } from 'src/auth/auth.service';
import { OtpHelper } from 'src/auth/helper-service/otp.helper';
import { ActivitylogService } from 'src/activitylog/activitylog.service';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [
    IncidentsService,
    SupabaseService,
    AuthService,
    OtpHelper,
    supabaseHelper,
    HashService,
    ActivitylogService,
    EmailService,
  ],
  controllers: [IncidentsController],
})
export class IncidentsModule {}
