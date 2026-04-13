import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';

@Controller('branches/:branchId/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly inventory: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Query('category') category?: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.inventory.list({ businessId: user!.businessId!, branchId, category });
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.inventory.create({
      businessId: user!.businessId!,
      branchId,
      name: String(body.name || ''),
      category: body.category ? String(body.category) : undefined,
      quantity: Number(body.quantity || 0),
      unit: body.unit ? String(body.unit) : undefined,
      lowStockThreshold: Number(body.lowStockThreshold || 0),
      costPrice: Number(body.costPrice || 0),
    });
  }

  @Patch(':itemId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.inventory.update(itemId, body);
  }

  @Delete(':itemId')
  async remove(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.inventory.remove(itemId);
  }
}

