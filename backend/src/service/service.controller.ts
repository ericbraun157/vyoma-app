import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from './service.service';

@Controller('branches/:branchId/services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    private readonly services: ServiceService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload | undefined, @Param('branchId') branchId: string) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.services.list({ businessId: user!.businessId!, branchId });
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.services.create({
      businessId: user!.businessId!,
      branchId,
      name: String(body.name || ''),
      price: Number(body.price || 0),
      duration: Number(body.duration || 30),
      category: body.category ? String(body.category) : undefined,
    });
  }

  @Patch(':serviceId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.services.update(serviceId, body);
  }

  @Delete(':serviceId')
  async remove(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('serviceId') serviceId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.services.remove(serviceId);
  }
}

