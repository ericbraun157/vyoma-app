import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './auth.types';

type OtpRecord = { otp: string; expiresAt: number };

@Injectable()
export class AuthService {
  // For MVP we use an in-memory OTP store (single instance). Replace with Redis in production.
  private otpStore = new Map<string, OtpRecord>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async requestOtp(mobile: string) {
    // Reasoning: MVP uses a fixed OTP for predictable demo flows; swap to random + SMS in production.
    const otp = '1234';
    const expiresAt = Date.now() + 5 * 60_000;

    this.otpStore.set(mobile, { otp, expiresAt });

    // PHASE 2: Send OTP via SMS provider or WhatsApp Business API
    return { sent: true, expiresInSeconds: 300 };
  }

  async verifyOtp(mobile: string, otp: string) {
    const record = this.otpStore.get(mobile);
    if (!record || record.expiresAt < Date.now() || record.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(mobile);

    const user =
      (await this.prisma.user.findUnique({ where: { mobile } })) ??
      (await this.prisma.user.create({
        data: {
          mobile,
          role: 'owner',
        },
      }));

    // Business/branch context is added once business setup completes.
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        mobile: user.mobile,
        role: user.role,
        displayName: user.displayName,
      },
    };
  }
}

