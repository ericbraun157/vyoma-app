// Extends Express Request for webhook signature verification.
declare namespace Express {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Request {
    rawBody?: Buffer;
  }
}

