/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
  @Get('profile')
  getProfile() {
    return {message: "hello nauman ali............." };
  }
}
