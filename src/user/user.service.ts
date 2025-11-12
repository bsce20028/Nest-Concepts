/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { supabaseHelper } from 'src/auth/helper-service/supabase.helper';
@Injectable()
export class UserService {
    constructor(private supabaseHelper: supabaseHelper) {}
    async getallUsers() {
        return this.supabaseHelper.getAllUsers();
    }

}
