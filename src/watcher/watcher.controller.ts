/* eslint-disable prettier/prettier */
import { Controller, Post, Delete, Param, Req } from '@nestjs/common';
import { WatcherService } from './watcher.service';
import type { AuthenticatedRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('watchers')
export class WatcherController {
  constructor(private readonly watcherService: WatcherService) {}

  @Post(':incidentId')
  addWatcher(@Param('incidentId') incidentId: number, @Req() req: AuthenticatedRequest) {
    return this.watcherService.addWatcher(incidentId, req.user.id);
  }

  @Delete(':incidentId')
  removeWatcher(@Param('incidentId') incidentId: number, @Req() req: AuthenticatedRequest) {
    return this.watcherService.removeWatcher(incidentId, req.user.id);
  }

}
