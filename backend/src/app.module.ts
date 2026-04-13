import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { BranchModule } from './branch/branch.module';
import { CustomerModule } from './customer/customer.module';
import { StaffModule } from './staff/staff.module';
import { ServiceModule } from './service/service.module';
import { BookingModule } from './booking/booking.module';
import { BillingModule } from './billing/billing.module';
import { InventoryModule } from './inventory/inventory.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { MigrateModule } from './migrate/migrate.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    BusinessModule,
    BranchModule,
    CustomerModule,
    StaffModule,
    ServiceModule,
    BookingModule,
    BillingModule,
    InventoryModule,
    WhatsappModule,
    RazorpayModule,
    MigrateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
