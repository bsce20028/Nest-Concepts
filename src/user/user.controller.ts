/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
//import { AuthGuard } from 'src/guards/auth/auth.guard';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @UseGuards(SupabaseAuthGuard)
    async getAllUsers() {
        return this.userService.getallUsers();
    }
}
