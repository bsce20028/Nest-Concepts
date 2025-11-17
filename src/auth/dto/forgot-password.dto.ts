import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDataDto {
  @ApiProperty({ example: 'Password reset OTP sent to your email.' })
  message: string;

  @ApiProperty({ example: '0b73f1a9-5852-4770-aa2d-5f0e3653c096' })
  userId: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ type: ForgotPasswordDataDto })
  data: ForgotPasswordDataDto;
}
