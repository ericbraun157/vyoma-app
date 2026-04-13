import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MigrateService } from './migrate.service';

@Controller('migrate')
@UseGuards(JwtAuthGuard)
export class MigrateController {
  constructor(private readonly migrate: MigrateService) {}

  @Post('bootstrap')
  async bootstrap(@CurrentUser() user: JwtPayload | undefined, @Body() payload: any) {
    if (!user?.sub) throw new Error('Missing user');
    // Only owners can bootstrap.
    if (user.role !== 'owner') throw new Error('Forbidden');
    return await this.migrate.bootstrap({ ownerUserId: user.sub, payload });
  }
}

