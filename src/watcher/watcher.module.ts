import { Module } from '@nestjs/common';
import { WatcherController } from './watcher.controller';
import { WatcherService } from './watcher.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [WatcherController],
  providers: [WatcherService, SupabaseService],
})
export class WatcherModule {}
