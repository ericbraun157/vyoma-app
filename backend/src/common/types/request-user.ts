export type RequestUser = {
  userId: string;
  businessId: string;
  // Selected branch context (for now required for most endpoints)
  branchId: string;
  role: 'owner' | 'manager' | 'staff';
};

