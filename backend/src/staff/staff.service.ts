import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { businessId: string; branchId: string }) {
    return await this.prisma.staff.findMany({
      where: { businessId: params.businessId, branchId: params.branchId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(params: {
    businessId: string;
    branchId: string;
    name: string;
    role: string;
    phone: string;
    workingDays: string[];
  }) {
    return await this.prisma.staff.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId,
        name: params.name,
        role: params.role,
        phone: params.phone,
        workingDays: params.workingDays,
        isActive: true,
      },
    });
  }

  async update(staffId: string, data: Record<string, unknown>) {
    return await this.prisma.staff.update({
      where: { id: staffId },
      data: data as any,
    });
  }

  async remove(staffId: string) {
    return await this.prisma.staff.delete({ where: { id: staffId } });
  }
}

