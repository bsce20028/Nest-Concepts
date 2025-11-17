import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class UserDto {
  @ApiProperty({ example: '0b73f1a9-5852-4770-aa2d-5f0e3653c096' })
  id: string;

  @ApiProperty({ example: 'name@example.com' })
  email: string;

  @ApiProperty({ example: 'myname' })
  username: string;

  @ApiProperty({ example: 'user' })
  role: string;
}

export class LoginDataDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsImtpZCI6IldlWHh3TXBKcGhTdlZLNjkiLCJ0eXAiOiJKV1QifQ...',
  })
  access_token: string;

  @ApiProperty({ example: 't3ky4bilmtk6' })
  refresh_token: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ type: LoginDataDto })
  data: LoginDataDto;
}
