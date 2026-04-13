import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function defaultWorkingHours() {
  const day = { open: '09:00', close: '20:00', isOff: false };
  return {
    monday: day,
    tuesday: day,
    wednesday: day,
    thursday: day,
    friday: day,
    saturday: day,
    sunday: { open: '10:00', close: '18:00', isOff: false },
  };
}

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async setupOwnerBusiness(params: {
    userId: string;
    name: string;
    type: string;
    phone: string;
    city?: string;
  }) {
    const baseSlug = slugify(params.name);
    const bookingSlug = `${baseSlug}-${nanoid(4).toLowerCase()}`;

    const business = await this.prisma.business.create({
      data: {
        ownerUserId: params.userId,
        name: params.name,
        type: params.type,
        phone: params.phone,
        city: params.city,
        bookingSlug,
        workingHours: defaultWorkingHours(),
        plan: 'free',
      },
    });

    const branch = await this.prisma.branch.create({
      data: {
        businessId: business.id,
        name: 'Main Branch',
        city: params.city,
        isPrimary: true,
        workingHours: defaultWorkingHours(),
      },
    });

    await this.prisma.business.update({
      where: { id: business.id },
      data: { defaultBranchId: branch.id },
    });

    return { business, branch };
  }

  async getBusiness(businessId: string) {
    return await this.prisma.business.findUnique({ where: { id: businessId } });
  }

  async updateBusiness(businessId: string, data: Partial<{
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    city: string | null;
    gstin: string | null;
    upiId: string | null;
    workingHours: unknown;
    plan: 'free' | 'basic' | 'pro';
    defaultBranchId: string | null;
  }>) {
    return await this.prisma.business.update({
      where: { id: businessId },
      data: data as Prisma.BusinessUpdateInput,
    });
  }

  async listBranches(businessId: string) {
    return await this.prisma.branch.findMany({
      where: { businessId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }
}

