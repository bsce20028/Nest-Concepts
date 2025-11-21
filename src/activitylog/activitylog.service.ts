import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ActivitylogService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  async notifyWatchers(
    incidentId: number,
    activity: { action: string; performed_by: string; description?: string },
  ) {
    const { data: watchers, error: watcherError } =
      await this.supabaseService.supabase
        .from('incident_watchers')
        .select('watcher_user_id')
        .eq('incident_id', incidentId);

    if (watcherError || !watchers?.length) return;

    const userIds = watchers.map((w) => w.watcher_user_id);
    const { data: users } = await this.supabaseService.supabase
      .from('users')
      .select('email, username, id')
      .in('id', userIds);

    if (!users || users.length === 0) return;
    const { data: performer } = await this.supabaseService.supabase
      .from('users')
      .select('username')
      .eq('id', activity.performed_by)
      .single();

    const performerName = performer?.username ?? 'Unknown User';
    for (const user of users) {
      if (!user.email) continue;

      await this.emailService.sendTemplate(
        user.email,
        `Update on Incident #${incidentId}`,
        'activity',
        {
          incidentId,
          action: activity.action,
          performedBy: performerName,
          description: activity.description ?? 'No description provided',
          time: new Date().toLocaleString(),
        },
      );
    }
  }
}
