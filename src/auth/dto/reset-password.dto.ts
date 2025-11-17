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
