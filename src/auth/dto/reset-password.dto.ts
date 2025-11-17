import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ResetPasswordDataDto {
  @ApiProperty({ example: 'Password reset successfully' })
  message: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ type: ResetPasswordDataDto })
  data: ResetPasswordDataDto;
}
