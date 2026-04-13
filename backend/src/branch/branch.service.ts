import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async createBranch(params: {
    businessId: string;
    name: string;
    city?: string;
    address?: string;
    workingHours: unknown;
  }) {
    return await this.prisma.branch.create({
      data: {
        businessId: params.businessId,
        name: params.name,
        city: params.city,
        address: params.address,
        workingHours: params.workingHours as Prisma.InputJsonValue,
        isPrimary: false,
      },
    });
  }

  async updateBranch(branchId: string, businessId: string, data: Record<string, unknown>) {
    return await this.prisma.branch.update({
      where: { id: branchId },
      data: data as any,
    });
  }
}

