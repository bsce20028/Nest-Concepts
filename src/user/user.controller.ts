/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}
    @Get()
    @ApiBearerAuth('access-token')
    async getAllUsers() {
        return this.userService.getallUsers();
    }
}