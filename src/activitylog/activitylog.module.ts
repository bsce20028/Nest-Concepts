import { Module } from '@nestjs/common';
import { ActivitylogController } from './activitylog.controller';
import { ActivitylogService } from './activitylog.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [ActivitylogController],
  providers: [ActivitylogService, SupabaseService, EmailService],
})
export class ActivitylogModule {}
