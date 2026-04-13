import { Body, Controller, Post } from '@nestjs/common';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return await this.auth.requestOtp(dto.mobile);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.auth.verifyOtp(dto.mobile, dto.otp);
  }
}

