import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ActivitylogService } from 'src/activitylog/activitylog.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [ReportingController],
  providers: [
    ReportingService,
    SupabaseService,
    ActivitylogService,
    EmailService,
  ],
})
export class ReportingModule {}
