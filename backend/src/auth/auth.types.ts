import type { UserRole } from '../../generated/prisma/enums';

export type JwtPayload = {
  sub: string; // userId
  role: UserRole;
  businessId?: string;
  branchId?: string;
};

