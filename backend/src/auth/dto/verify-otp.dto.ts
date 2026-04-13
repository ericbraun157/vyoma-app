import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\d{10}$/)
  mobile!: string;

  // MVP: 4-digit OTP.
  @IsString()
  @Matches(/^\d{4}$/)
  otp!: string;
}

