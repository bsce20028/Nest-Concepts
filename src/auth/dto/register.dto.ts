import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  username: string;
}

export class RegisterUserDto {
  @ApiProperty({ example: '0b73f1a9-5852-4770-aa2d-5f0e3653c096' })
  id: string;

  @ApiProperty({ example: 'arslan55@gmail.com' })
  email: string;

  @ApiProperty({ example: 'arslan55' })
  username: string;
}

export class RegisterDataDto {
  @ApiProperty({ example: 'User registered successfully. OTP sent to email.' })
  message: string;

  @ApiProperty({ type: RegisterUserDto })
  user: RegisterUserDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ type: RegisterDataDto })
  data: RegisterDataDto;
}
