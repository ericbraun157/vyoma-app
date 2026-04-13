import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

@Controller('billing/subscriptions/razorpay')
export class RazorpayController {
  constructor(private readonly razorpay: RazorpayService) {}

  @Post('create-order')
  async createOrder(@Body() body: Record<string, unknown>) {
    const businessId = String(body.businessId || '');
    const plan = (body.plan === 'pro' ? 'pro' : 'basic') as 'basic' | 'pro';
    const amountInPaise =
      plan === 'pro' ? 1499 * 100 : 799 * 100;

    return await this.razorpay.createOrder({ businessId, plan, amountInPaise });
  }

  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    const rawBody: Buffer | undefined = req.rawBody;
    const ok = rawBody && signature ? this.razorpay.verifyWebhookSignature(rawBody, signature) : false;

    // In dev, we accept unsigned webhooks to unblock local testing.
    const allowInsecure = process.env.NODE_ENV !== 'production';
    if (!ok && !allowInsecure) {
      return { received: true, verified: false };
    }

    const result = await this.razorpay.applyWebhookEvent(req.body);
    return { received: true, verified: ok, ...result };
  }
}

