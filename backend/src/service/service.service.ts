import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { businessId: string; branchId: string }) {
    return await this.prisma.service.findMany({
      where: { businessId: params.businessId, branchId: params.branchId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(params: {
    businessId: string;
    branchId: string;
    name: string;
    price: number;
    duration: number;
    category?: string;
  }) {
    return await this.prisma.service.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        name: params.name,
        price: params.price,
        duration: params.duration,
        category: params.category,
        isActive: true,
      },
    });
  }

  async update(serviceId: string, data: Record<string, unknown>) {
    return await this.prisma.service.update({ where: { id: serviceId }, data: data as any });
  }

  async remove(serviceId: string) {
    return await this.prisma.service.delete({ where: { id: serviceId } });
  }
}

