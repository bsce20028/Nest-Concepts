import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class WatcherService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async addWatcher(incidentId: number, userId: string) {
    const { data: existing, error: existingError } =
      await this.supabaseService.supabase
        .from('incident_watchers')
        .select('*')
        .eq('incident_id', incidentId)
        .eq('watcher_user_id', userId)
        .maybeSingle();

    if (existingError) {
      throw new ConflictException('Failed to check watcher status');
    }

    if (existing) {
      throw new ConflictException('You are already watching this incident');
    }
    const { data, error } = await this.supabaseService.supabase
      .from('incident_watchers')
      .insert({
        incident_id: incidentId,
        watcher_user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return { message: 'Watcher added', watcher: data };
  }

  async removeWatcher(incidentId: number, userId: string) {
    const { data: existing, error: existingError } =
      await this.supabaseService.supabase
        .from('incident_watchers')
        .select('*')
        .eq('incident_id', incidentId)
        .eq('watcher_user_id', userId)
        .maybeSingle();

    if (existingError) {
      throw new NotFoundException('Error checking existing watcher');
    }

    if (!existing) {
      throw new NotFoundException('No watcher found for this incident');
    }

    const { error } = await this.supabaseService.supabase
      .from('incident_watchers')
      .delete()
      .eq('incident_id', incidentId)
      .eq('watcher_user_id', userId);

    if (error) throw error;

    return { message: 'Watcher removed' };
  }
}
