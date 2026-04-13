import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async list(params: {
    businessId: string;
    branchId: string;
    date?: string;
    status?: string;
  }) {
    return await this.prisma.booking.findMany({
      where: {
        businessId: params.businessId,
        branchId: params.branchId,
        ...(params.date ? { date: params.date } : {}),
        ...(params.status ? { status: params.status as any } : {}),
      },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });
  }

  async create(params: {
    businessId: string;
    branchId: string;
    customerId: string;
    serviceId: string;
    staffId?: string | null;
    date: string;
    time: string;
    notes?: string;
  }) {
    const [customer, service, staff] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: params.customerId } }),
      this.prisma.service.findUnique({ where: { id: params.serviceId } }),
      params.staffId ? this.prisma.staff.findUnique({ where: { id: params.staffId } }) : Promise.resolve(null),
    ]);

    if (!customer || !service) {
      throw new Error('Invalid customer or service');
    }

    const booking = await this.prisma.booking.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        staffId: staff?.id ?? null,
        staffName: staff?.name ?? null,
        date: params.date,
        time: params.time,
        duration: service.duration,
        status: 'confirmed',
        notes: params.notes,
      },
    });

    // PHASE 2: Trigger WhatsApp Business message via Gupshup if configured.
    void this.whatsapp.sendText({
      to: booking.customerPhone,
      text: `Hi ${booking.customerName}! Your ${booking.serviceName} appointment is confirmed for ${booking.date} at ${booking.time}.`,
    });

    return booking;
  }

  async update(bookingId: string, data: Record<string, unknown>) {
    return await this.prisma.booking.update({
      where: { id: bookingId },
      data: data as any,
    });
  }

  async markComplete(bookingId: string) {
    return await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed' },
    });
  }

  async cancel(bookingId: string) {
    return await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });
  }
}

