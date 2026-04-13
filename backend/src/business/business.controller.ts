import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertBusinessContext } from '../common/guards/branch-access';
import { BusinessSetupDto } from './dto/business-setup.dto';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(
    private readonly business: BusinessService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('business/setup')
  async setup(@CurrentUser() user: JwtPayload | undefined, @Body() dto: BusinessSetupDto) {
    if (!user?.sub) throw new Error('Missing user');
    const { business, branch } = await this.business.setupOwnerBusiness({
      userId: user.sub,
      name: dto.name,
      type: dto.type,
      phone: dto.phone,
      city: dto.city,
    });

    const accessToken = await this.jwt.signAsync({
      sub: user.sub,
      role: user.role,
      businessId: business.id,
      branchId: branch.id,
    } satisfies JwtPayload);

    return { accessToken, business, branch };
  }

  @Get('business')
  async getBusiness(@CurrentUser() user: JwtPayload | undefined) {
    assertBusinessContext(user);
    return await this.business.getBusiness(user!.businessId!);
  }

  @Patch('business')
  async patchBusiness(
    @CurrentUser() user: JwtPayload | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    assertBusinessContext(user);
    // Reasoning: allow partial updates for MVP; validate more strictly when UI stabilizes.
    return await this.business.updateBusiness(user!.businessId!, body as any);
  }

  @Get('branches')
  async listBranches(@CurrentUser() user: JwtPayload | undefined) {
    assertBusinessContext(user);
    return await this.business.listBranches(user!.businessId!);
  }

  @Get('dashboard')
  async dashboard(@CurrentUser() user: JwtPayload | undefined) {
    assertBusinessContext(user);
    const branchId = user!.branchId!;

    // Compute lightweight aggregates for the app dashboard.
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const [todaysBookings, todaysRevenueAgg, pendingInvoicesAgg, activeCustomers] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            businessId: user!.businessId!,
            branchId,
            date,
            status: { in: ['pending', 'confirmed', 'completed'] },
          },
        }),
        this.prisma.invoice.aggregate({
          where: {
            businessId: user!.businessId!,
            branchId,
            status: 'paid',
          },
          _sum: { total: true },
        }),
        this.prisma.invoice.aggregate({
          where: {
            businessId: user!.businessId!,
            branchId,
            status: { in: ['pending', 'overdue'] },
          },
          _sum: { total: true },
          _count: { _all: true },
        }),
        this.prisma.customer.count({
          where: { businessId: user!.businessId!, branchId },
        }),
      ]);

    return {
      date,
      todaysBookings,
      todaysRevenue: todaysRevenueAgg._sum.total ?? 0,
      pendingPaymentsAmount: pendingInvoicesAgg._sum.total ?? 0,
      pendingPaymentsCount: pendingInvoicesAgg._count._all ?? 0,
      activeCustomers,
    };
  }
}

