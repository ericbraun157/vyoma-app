import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type BootstrapPayload = {
  business: any;
  branch: any;
  customers?: any[];
  staff?: any[];
  services?: any[];
  bookings?: any[];
  invoices?: any[];
  inventory?: any[];
};

@Injectable()
export class MigrateService {
  constructor(private readonly prisma: PrismaService) {}

  async bootstrap(params: { ownerUserId: string; payload: BootstrapPayload }) {
    const { business, branch } = params.payload;

    const created = await this.prisma.business.create({
      data: {
        id: business.id,
        ownerUserId: params.ownerUserId,
        name: business.name,
        type: business.type,
        phone: business.phone,
        email: business.email ?? null,
        address: business.address ?? null,
        city: business.city ?? null,
        gstin: business.gstin ?? null,
        upiId: business.upiId ?? null,
        bookingSlug: business.bookingSlug,
        workingHours: (business.workingHours ?? {}) as Prisma.InputJsonValue,
        plan: business.plan ?? 'free',
        defaultBranchId: branch.id,
      },
    });

    await this.prisma.branch.create({
      data: {
        id: branch.id,
        businessId: created.id,
        name: branch.name ?? 'Main Branch',
        address: branch.address ?? null,
        city: branch.city ?? null,
        isPrimary: true,
        workingHours: (branch.workingHours ?? business.workingHours ?? {}) as Prisma.InputJsonValue,
      },
    });

    const businessId = created.id;
    const branchId = branch.id;

    const customers = params.payload.customers ?? [];
    const staff = params.payload.staff ?? [];
    const services = params.payload.services ?? [];
    const bookings = params.payload.bookings ?? [];
    const invoices = params.payload.invoices ?? [];
    const inventory = params.payload.inventory ?? [];

    if (customers.length) {
      await this.prisma.customer.createMany({
        data: customers.map((c) => ({
          id: c.id,
          businessId,
          branchId,
          name: c.name,
          phone: c.phone,
          email: c.email ?? null,
          notes: c.notes ?? null,
          totalVisits: c.totalVisits ?? 0,
          totalSpent: c.totalSpent ?? 0,
          lastVisit: c.lastVisit ? new Date(c.lastVisit) : null,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (staff.length) {
      await this.prisma.staff.createMany({
        data: staff.map((s) => ({
          id: s.id,
          businessId,
          branchId,
          name: s.name,
          role: s.role,
          phone: s.phone,
          isActive: s.isActive ?? true,
          workingDays: Array.isArray(s.workingDays) ? s.workingDays : [],
          createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (services.length) {
      await this.prisma.service.createMany({
        data: services.map((svc) => ({
          id: svc.id,
          businessId,
          branchId,
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          category: svc.category ?? null,
          isActive: svc.isActive ?? true,
        })),
        skipDuplicates: true,
      });
    }

    if (bookings.length) {
      await this.prisma.booking.createMany({
        data: bookings.map((b) => ({
          id: b.id,
          businessId,
          branchId,
          customerId: b.customerId,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          serviceId: b.serviceId,
          serviceName: b.serviceName,
          servicePrice: b.servicePrice,
          staffId: b.staffId ?? null,
          staffName: b.staffName ?? null,
          date: b.date,
          time: b.time,
          duration: b.duration,
          status: b.status,
          notes: b.notes ?? null,
          createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (invoices.length) {
      await this.prisma.invoice.createMany({
        data: invoices.map((inv) => ({
          id: inv.id,
          businessId,
          branchId,
          number: inv.number,
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerPhone: inv.customerPhone,
          bookingId: inv.bookingId ?? null,
          items: (inv.items ?? []) as Prisma.InputJsonValue,
          subtotal: inv.subtotal,
          gstPercent: inv.gstPercent ?? 0,
          gstAmount: inv.gstAmount ?? 0,
          total: inv.total,
          status: inv.status ?? 'pending',
          paymentMethod: inv.paymentMethod ?? null,
          dueDate: new Date(inv.dueDate),
          paidAt: inv.paidAt ? new Date(inv.paidAt) : null,
          createdAt: inv.createdAt ? new Date(inv.createdAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (inventory.length) {
      await this.prisma.inventoryItem.createMany({
        data: inventory.map((it) => ({
          id: it.id,
          businessId,
          branchId,
          name: it.name,
          category: it.category ?? null,
          quantity: it.quantity ?? 0,
          unit: it.unit ?? null,
          lowStockThreshold: it.lowStockThreshold ?? 0,
          costPrice: it.costPrice ?? 0,
          createdAt: it.createdAt ? new Date(it.createdAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    return { businessId, branchId };
  }
}

