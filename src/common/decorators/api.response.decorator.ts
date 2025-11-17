/* eslint-disable prettier/prettier */
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterResponseDto } from '../../auth/dto/register.dto';
import { VerifyOtpResponseDto } from '../../auth/dto/verify-otp.dto';
import { LoginResponseDto } from '../../auth/dto/login.dto';
import { ForgotPasswordResponseDto } from '../../auth/dto/forgot-password.dto';
import { ResetPasswordResponseDto } from '../../auth/dto/reset-password.dto';

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiCreatedResponse({
      description: 'User registered successfully. OTP sent to email.',
      type: RegisterResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request - Invalid input data' }),
    ApiResponse({ status: 409, description: 'User already exists' }),
  );
}

export function ApiVerifyOtp() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify OTP for user registration' }),
    ApiOkResponse({
      description: 'OTP verified successfully',
      type: VerifyOtpResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid or expired OTP' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiOkResponse({
      description: 'Login successful. Returns user data and tokens.',
      type: LoginResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
    ApiResponse({ status: 403, description: 'Email not verified' }),
  );
}

export function ApiForgotPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Request password reset' }),
    ApiOkResponse({
      description: 'Password reset OTP sent to email',
      type: ForgotPasswordResponseDto,
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password with OTP' }),
    ApiOkResponse({
      description: 'Password reset successfully',
      type: ResetPasswordResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid or expired OTP' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
