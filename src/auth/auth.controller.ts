/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CookieConfig } from '../config/cookie.config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.username);
  }

  @Post('verify-otp')
  @UsePipes(new ValidationPipe())
  verifyOtp(@Body() body: { userId: string; otp: string }) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }
  
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const loginResult = await this.authService.login(dto.email, dto.password);
    
    res.cookie(
      CookieConfig.REFRESH_TOKEN.name,
      loginResult.refresh_token,
      CookieConfig.REFRESH_TOKEN.options
    );

    return {
      user: loginResult.user,
      access_token: loginResult.access_token,
      refresh_token: loginResult.refresh_token,
    };
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe())
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe())
  resetPassword(@Body() body: { userId: string; newPassword: string }) {
    return this.authService.resetPassword(body.userId, body.newPassword);
  }
}
