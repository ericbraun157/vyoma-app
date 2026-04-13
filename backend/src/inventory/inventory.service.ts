import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { businessId: string; branchId: string; category?: string }) {
    return await this.prisma.inventoryItem.findMany({
      where: {
        businessId: params.businessId,
        branchId: params.branchId,
        ...(params.category && params.category !== 'all' ? { category: params.category } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async create(params: {
    businessId: string;
    branchId: string;
    name: string;
    category?: string;
    quantity: number;
    unit?: string;
    lowStockThreshold: number;
    costPrice: number;
  }) {
    return await this.prisma.inventoryItem.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        name: params.name,
        category: params.category,
        quantity: params.quantity,
        unit: params.unit,
        lowStockThreshold: params.lowStockThreshold,
        costPrice: params.costPrice,
      },
    });
  }

  async update(itemId: string, data: Record<string, unknown>) {
    return await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: data as any,
    });
  }

  async remove(itemId: string) {
    return await this.prisma.inventoryItem.delete({ where: { id: itemId } });
  }
}

