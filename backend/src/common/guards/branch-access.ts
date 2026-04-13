import { PrismaService } from '../../prisma/prisma.service';
import { forbidden, notFound } from '../errors/http-errors';

export async function assertBranchAccess(params: {
  prisma: PrismaService;
  businessId: string;
  branchId: string;
}) {
  const branch = await params.prisma.branch.findFirst({
    where: { id: params.branchId, businessId: params.businessId },
    select: { id: true },
  });
  if (!branch) throw notFound('Branch not found');
}

export function assertBusinessContext(payload?: {
  businessId?: string;
  branchId?: string;
}) {
  if (!payload?.businessId || !payload?.branchId) {
    throw forbidden('Business setup incomplete');
  }
}

