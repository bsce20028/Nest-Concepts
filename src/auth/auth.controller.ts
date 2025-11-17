/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CookieConfig } from '../config/cookie.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully. OTP sent to email.' })
  @ApiBadRequestResponse({ description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.username);
  }

  @Post('verify-otp')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Verify OTP for user registration' })
  @ApiOkResponse({ description: 'OTP verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.userId, dto.otp);
  }
  
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({ description: 'Login successful. Returns user data and tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Email not verified' })
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
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Password reset OTP sent to email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.userId, dto.newPassword);
  }
}
