/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CookieConfig } from '../config/cookie.config';
import {
  ApiRegister,
  ApiVerifyOtp,
  ApiLogin,
  ApiForgotPassword,
  ApiResetPassword,
} from '../common/decorators/api.response.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiRegister()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.username);
  }

  @Post('verify-otp')
  @UsePipes(new ValidationPipe())
  @ApiVerifyOtp()
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.userId, dto.otp);
  }
  
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiLogin()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const loginResult = await this.authService.login(dto.email, dto.password);
    
    res.cookie(
      CookieConfig.ACCESS_TOKEN.name,
      loginResult.access_token,
      CookieConfig.ACCESS_TOKEN.options
    );

    res.cookie(
      CookieConfig.REFRESH_TOKEN.name,
      loginResult.refresh_token,
      CookieConfig.REFRESH_TOKEN.options
    );

    return {
      user: loginResult.user,
      access_token: loginResult.access_token,
    };
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe())
  @ApiForgotPassword()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe())
  @ApiResetPassword()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.userId, dto.newPassword);
  }
}
