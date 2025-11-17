/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import { supabaseHelper } from 'src/auth/helper-service/supabase.helper';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);  

  constructor(
    private supabaseHelper: supabaseHelper,
  ) {}

  async getallUsers() {
    this.logger.log('Fetching all users...');
    const users = await this.supabaseHelper.getAllUsers();

    this.logger.debug(`Fetched ${(users?.length ?? 0)} users`);
    this.logger.log('Users fetched successfully');

    return users;
  }
}
