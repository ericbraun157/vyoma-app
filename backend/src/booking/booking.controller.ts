import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBranchAccess, assertBusinessContext } from '../common/guards/branch-access';
import { PrismaService } from '../prisma/prisma.service';
import { BookingService } from './booking.service';

@Controller('branches/:branchId/bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(
    private readonly bookings: BookingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.bookings.list({ businessId: user!.businessId!, branchId, date, status });
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.bookings.create({
      businessId: user!.businessId!,
      branchId,
      customerId: String(body.customerId || ''),
      serviceId: String(body.serviceId || ''),
      staffId: body.staffId ? String(body.staffId) : null,
      date: String(body.date || ''),
      time: String(body.time || ''),
      notes: body.notes ? String(body.notes) : undefined,
    });
  }

  @Patch(':bookingId')
  async patch(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('bookingId') bookingId: string,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.bookings.update(bookingId, body);
  }

  @Post(':bookingId/complete')
  async complete(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('bookingId') bookingId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.bookings.markComplete(bookingId);
  }

  @Post(':bookingId/cancel')
  async cancel(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('branchId') branchId: string,
    @Param('bookingId') bookingId: string,
  ) {
    assertBusinessContext(user);
    await assertBranchAccess({ prisma: this.prisma, businessId: user!.businessId!, branchId });
    return await this.bookings.cancel(bookingId);
  }
}

