import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  // Indian mobile numbers (10 digits). App sends only digits; backend normalizes.
  @IsString()
  @Matches(/^\d{10}$/)
  mobile!: string;
}

