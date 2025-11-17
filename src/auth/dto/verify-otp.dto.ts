import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class VerifyOtpDataDto {
  @ApiProperty({ example: 'OTP verified successfully' })
  message: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ type: VerifyOtpDataDto })
  data: VerifyOtpDataDto;
}
