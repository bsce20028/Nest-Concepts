/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleEnum } from '../common/enum/role.enum';
import { RoleGuard } from 'src/guards/role/role.guard';

@Controller('user-roles')
export class UserRolesController {
    @Get('admin-data')
    @UseGuards(RoleGuard)
    @Roles(RoleEnum.ADMIN)
    getAdminData() {
        return { data: 'Only admin can access' };
    }

    @Get('user-data')
    getUserData() {
        return { data: 'All users can access' };
    }
}