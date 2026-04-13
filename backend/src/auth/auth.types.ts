import type { UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string; // userId
  role: UserRole;
  businessId?: string;
  branchId?: string;
};

