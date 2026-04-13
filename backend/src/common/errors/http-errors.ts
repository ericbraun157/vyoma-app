import { ForbiddenException, NotFoundException } from '@nestjs/common';

export const notFound = (message = 'Not found') => new NotFoundException(message);
export const forbidden = (message = 'Forbidden') => new ForbiddenException(message);

