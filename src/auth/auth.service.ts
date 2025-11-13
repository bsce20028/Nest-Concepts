/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, username: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.supabaseService.createUser(email, hashedPassword, username);

      if (!user) {
        throw new ConflictException('User with this email or username already exists');
      }

      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Registration failed - user may already exist');
    }
  }

  async login(email: string, password: string) {
    const user = await this.supabaseService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      access_token: token,
    };
  }
}
