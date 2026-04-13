import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { notFound } from '../common/errors/http-errors';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';

@Controller('branches/:branchId')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('invoices')
  async listInvoices(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Query('status') status?: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.billing.listInvoices({ businessId: user!.businessId!, branchId, status });
  }

  @Post('invoices')
  async createInvoice(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.billing.createInvoice({
      businessId: user!.businessId!,
      branchId,
      customerId: String(body.customerId || ''),
      bookingId: body.bookingId ? String(body.bookingId) : null,
      items: Array.isArray(body.items) ? (body.items as any) : [],
      gstPercent: Number(body.gstPercent || 0),
      dueDate: String(body.dueDate || new Date().toISOString()),
      paymentMethod: body.paymentMethod ? String(body.paymentMethod) : null,
      notes: body.notes ? String(body.notes) : undefined,
    });
  }

  @Get('invoices/:invoiceId')
  async getInvoice(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    const invoice = await this.billing.getInvoice({ businessId: user!.businessId!, branchId, invoiceId });
    if (!invoice) throw notFound('Invoice not found');
    return invoice;
  }

  @Post('invoices/:invoiceId/mark-paid')
  async markPaid(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.billing.markPaid(invoiceId, body.paymentMethod ? String(body.paymentMethod) : null);
  }
}

