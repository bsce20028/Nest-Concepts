/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Injectable, Inject } from '@nestjs/common';
import { supabaseHelper } from 'src/auth/helper-service/supabase.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

@Injectable()
export class UserService {

  constructor(
    private supabaseHelper: supabaseHelper,
    @Inject(WINSTON_MODULE_PROVIDER as string)
    private readonly logger: Logger,
  ) {}

  async getallUsers() {
    this.logger.info('Fetching all users...');

    const users = await this.supabaseHelper.getAllUsers();

    this.logger.debug(`Fetched ${users?.length ?? 0} users`);
    this.logger.info('Users fetched successfully');

    this.logger.warn('This is a warning log example');
    this.logger.error('This is an error log example');
    return users;
  }
}
