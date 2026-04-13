import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { PrismaService } from '../prisma/prisma.service';
import { BranchService } from './branch.service';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchController {
  constructor(
    private readonly branch: BranchService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload | undefined, @Body() body: Record<string, unknown>) {
    assertBusinessContext(user);
    return await this.branch.createBranch({
      businessId: user!.businessId!,
      name: String(body.name || 'New Branch'),
      city: body.city ? String(body.city) : undefined,
      address: body.address ? String(body.address) : undefined,
      workingHours: body.workingHours ?? {},
    });
  }

  @Patch(':branchId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({
      prisma: this.prisma,
      businessId: user!.businessId!,
      branchId,
    });
    return await this.branch.updateBranch(branchId, user!.businessId!, body);
  }
}

