import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

function nextInvoiceNumber(last?: string | null) {
  // INV-0001 style.
  const n = last ? Number(last.split('-')[1] || 0) : 0;
  const next = (n + 1).toString().padStart(4, '0');
  return `INV-${next}`;
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async listInvoices(params: {
    businessId: string;
    branchId: string;
    status?: string;
  }) {
    return await this.prisma.invoice.findMany({
      where: {
        businessId: params.businessId,
        branchId: params.branchId,
        ...(params.status ? { status: params.status as any } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async createInvoice(params: {
    businessId: string;
    branchId: string;
    customerId: string;
    bookingId?: string | null;
    items: Array<{ name: string; quantity: number; rate: number; amount: number }>;
    gstPercent: number;
    dueDate: string;
    paymentMethod?: string | null;
    notes?: string;
  }) {
    const customer = await this.prisma.customer.findUnique({ where: { id: params.customerId } });
    if (!customer) throw new Error('Invalid customer');

    const last = await this.prisma.invoice.findFirst({
      where: { businessId: params.businessId },
      orderBy: { createdAt: 'desc' },
      select: { number: true },
    });

    const subtotal = params.items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const gstPercent = params.gstPercent === 18 ? 18 : 0;
    const gstAmount = Math.round((subtotal * gstPercent) / 100);
    const total = subtotal + gstAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        number: nextInvoiceNumber(last?.number),
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        bookingId: params.bookingId ?? null,
        items: params.items as unknown as Prisma.InputJsonValue,
        subtotal,
        gstPercent,
        gstAmount,
        total,
        status: 'pending',
        paymentMethod: (params.paymentMethod as any) ?? null,
        dueDate: new Date(params.dueDate),
      },
    });

    void this.whatsapp.sendText({
      to: invoice.customerPhone,
      text: `Invoice ${invoice.number} total ₹${invoice.total} due ${invoice.dueDate.toISOString().slice(0, 10)}. Thank you!`,
    });

    return invoice;
  }

  async markPaid(invoiceId: string, paymentMethod?: string | null) {
    return await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: (paymentMethod as any) ?? undefined,
      },
    });
  }

  async getInvoice(params: { businessId: string; branchId: string; invoiceId: string }) {
    return await this.prisma.invoice.findFirst({
      where: {
        id: params.invoiceId,
        businessId: params.businessId,
        branchId: params.branchId,
      },
    });
  }
}

