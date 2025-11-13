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

    await this.supabaseService
      .supabase
      .from('user_otps')
      .delete()
      .eq('user_id', userId);

    const { error } = await this.supabaseService
      .supabase
      .from('user_otps')
      .insert({
        user_id: userId,
        otp: Number(otp),
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw new BadRequestException(error.message);

    await this.sendEmail(email, otp);
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(userId: string, otp: string) {
    const { data, error } = await this.supabaseService
      .supabase
      .from('user_otps')
      .select('*')
      .eq('otp', Number(otp))
      .eq('verified', false)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error || !data) throw new BadRequestException('Invalid OTP');

    if (new Date(data.expires_at) < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.supabaseService
      .supabase
      .from('user_otps')
      .update({ verified: true })
      .eq('id', data.id);

    await this.supabaseService
      .supabase
      .from('user_otps')
      .delete()
      .neq('id', data.id)
      .eq('user_id', userId);

    return { message: 'OTP verified successfully' };
  }

  async sendPasswordResetOtp(userId: string, email: string) {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.otpExpireMinutes * 60 * 1000);

    await this.supabaseService
      .supabase
      .from('user_otps')
      .delete()
      .eq('user_id', userId);

    const { error } = await this.supabaseService
      .supabase
      .from('user_otps')
      .insert({
        user_id: userId,
        otp: Number(otp),
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw new BadRequestException(error.message);

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It expires in ${this.otpExpireMinutes} minutes.`,
    });

    return { message: 'Password reset OTP sent to email' };
  }

  async checkVerifiedOtp(userId: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .supabase
      .from('user_otps')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', true)
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();
    console.log(data, error);
    if (error || !data) return false;

    if (new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;
  }
}
