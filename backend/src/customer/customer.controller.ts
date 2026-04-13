import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { notFound } from '../common/errors/http-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerService } from './customer.service';

@Controller('branches/:branchId/customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly customers: CustomerService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Query('q') q?: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.customers.list({ businessId: user!.businessId!, branchId, q });
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.customers.create({
      businessId: user!.businessId!,
      branchId,
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      email: body.email ? String(body.email) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
    });
  }

  @Get(':customerId')
  async get(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('customerId') customerId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    const customer = await this.customers.get({
      businessId: user!.businessId!,
      branchId,
      customerId,
    });
    if (!customer) throw notFound('Customer not found');
    return customer;
  }

  @Patch(':customerId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('customerId') customerId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.customers.update({
      businessId: user!.businessId!,
      branchId,
      customerId,
      data: body,
    });
  }

  @Delete(':customerId')
  async remove(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('customerId') customerId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.customers.remove({ businessId: user!.businessId!, branchId, customerId });
  }
}

