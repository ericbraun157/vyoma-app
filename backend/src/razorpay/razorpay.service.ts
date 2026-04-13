import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

function basicAuthHeader(keyId: string, keySecret: string) {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${token}`;
}

@Injectable()
export class RazorpayService {
  constructor(private readonly prisma: PrismaService) {}

  private get creds() {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    return { keyId, keySecret, ok: Boolean(keyId && keySecret) };
  }

  async createOrder(params: { businessId: string; plan: 'basic' | 'pro'; amountInPaise: number }) {
    const { keyId, keySecret, ok } = this.creds;
    if (!ok) {
      // MVP: allow UI to proceed in test-only environments by returning a dummy order.
      return { keyId: 'rzp_test_dummy', order: { id: 'order_dummy', amount: params.amountInPaise, currency: 'INR' } };
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(keyId, keySecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountInPaise,
        currency: 'INR',
        receipt: `vyoma_${params.businessId}_${Date.now()}`,
        notes: {
          businessId: params.businessId,
          plan: params.plan,
        },
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Razorpay order create failed: ${res.status} ${JSON.stringify(body)}`);
    }

    return { keyId, order: body };
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async applyWebhookEvent(event: any) {
    // Minimal handling: when payment is captured, upgrade plan based on notes.
    if (event?.event !== 'payment.captured') return { applied: false };
    const notes = event?.payload?.payment?.entity?.notes ?? {};
    const businessId = notes.businessId;
    const plan = notes.plan;
    if (!businessId || !plan) return { applied: false };

    await this.prisma.business.update({
      where: { id: businessId },
      data: { plan },
    });
    return { applied: true };
  }

  // PHASE 2: Add subscriptions API + handle subscription lifecycle webhooks
}

