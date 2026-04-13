import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { PrismaService } from '../prisma/prisma.service';
import { StaffService } from './staff.service';

@Controller('branches/:branchId/staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(
    private readonly staff: StaffService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload | undefined, @Param('branchId') branchId: string) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.staff.list({ businessId: user!.businessId!, branchId });
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.staff.create({
      businessId: user!.businessId!,
      branchId,
      name: String(body.name || ''),
      role: String(body.role || 'Staff'),
      phone: String(body.phone || ''),
      workingDays: Array.isArray(body.workingDays) ? (body.workingDays as string[]) : [],
    });
  }

  @Patch(':staffId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('staffId') staffId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.staff.update(staffId, body);
  }

  @Delete(':staffId')
  async remove(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('staffId') staffId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.staff.remove(staffId);
  }
}

