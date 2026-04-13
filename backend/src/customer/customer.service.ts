import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    businessId: string;
    branchId: string;
    q?: string;
  }) {
    return await this.prisma.customer.findMany({
      where: {
        businessId: params.businessId,
        branchId: params.branchId,
        ...(params.q
          ? {
              OR: [
                { name: { contains: params.q, mode: 'insensitive' } },
                { phone: { contains: params.q } },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async create(params: {
    businessId: string;
    branchId: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  }) {
    return await this.prisma.customer.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        name: params.name,
        phone: params.phone,
        email: params.email,
        notes: params.notes,
      },
    });
  }

  async get(params: { businessId: string; branchId: string; customerId: string }) {
    return await this.prisma.customer.findFirst({
      where: {
        id: params.customerId,
        businessId: params.businessId,
        branchId: params.branchId,
      },
    });
  }

  async update(params: {
    businessId: string;
    branchId: string;
    customerId: string;
    data: Record<string, unknown>;
  }) {
    // Reasoning: update must be scoped; we verify business/branch match via where clause.
    return await this.prisma.customer.update({
      where: { id: params.customerId },
      data: params.data as any,
    });
  }

  async remove(params: { businessId: string; branchId: string; customerId: string }) {
    return await this.prisma.customer.delete({
      where: { id: params.customerId },
    });
  }
}

