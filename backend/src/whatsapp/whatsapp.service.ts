import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private get enabled() {
    return Boolean(process.env.GUPSHUP_API_KEY && process.env.GUPSHUP_APP_NAME);
  }

  async sendText(params: { to: string; text: string }) {
    // MVP: optional integration. If not configured, we no-op but log.
    if (!this.enabled) {
      this.logger.debug(`WhatsApp disabled; would message ${params.to}: ${params.text}`);
      return { sent: false, reason: 'not_configured' };
    }

    const apiKey = process.env.GUPSHUP_API_KEY!;
    const appName = process.env.GUPSHUP_APP_NAME!;
    const source = process.env.GUPSHUP_SOURCE_NUMBER; // optional

    // Gupshup expects URL-encoded form data for many endpoints.
    const body = new URLSearchParams();
    body.set('channel', 'whatsapp');
    body.set('source', source || '');
    body.set('destination', `91${params.to}`);
    body.set('message', JSON.stringify({ type: 'text', text: params.text }));
    body.set('src.name', appName);

    const res = await fetch('https://api.gupshup.io/sm/api/v1/msg', {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.error(`Gupshup send failed: ${res.status} ${text}`);
      return { sent: false, status: res.status, body: text };
    }

    return { sent: true, body: text };
  }

  // PHASE 2: Add template messaging and inbound webhook processing (CONFIRM/YES replies)
}

