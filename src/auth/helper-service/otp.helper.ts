/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

@Injectable()
export class OtpHelper {
  private transporter;
  private otpExpireMinutes: number;

  constructor(private supabaseService: SupabaseService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.otpExpireMinutes = Number(process.env.OTP_EXPIRE_MINUTES) || 5;
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  private async sendEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in ${this.otpExpireMinutes} minutes.`,
    });
  }

  async sendOtp(userId: string, email: string) {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.otpExpireMinutes * 60 * 1000);

    const { error } = await this.supabaseService
      .getClient()
      .from('user_otps')
      .insert({
        user_id: userId,
        otp,
        expires_at: expiresAt,
      });

    if (error) throw new BadRequestException(error.message);

    await this.sendEmail(email, otp);
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(userId: string, otp: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_otps')
      .select('*')
      .eq('otp', otp)
      .eq('verified', false)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error || !data) throw new BadRequestException('Invalid OTP');

    if (new Date(data.expires_at as string) < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.supabaseService
      .getClient()
      .from('user_otps')
      .update({ verified: true })
      .eq('id', data.id);

    return { message: 'OTP verified successfully' };
  }
}
