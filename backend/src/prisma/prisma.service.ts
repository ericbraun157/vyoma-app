import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Prisma 7 moves datasource URLs to prisma.config.ts for CLI (migrations),
    // but PrismaClient still needs a runtime connection string via an adapter.
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma's event typings vary by generator/runtime; use process signals for consistent shutdown.
    process.on('beforeExit', () => {
      void app.close();
    });
    process.on('SIGINT', () => {
      void app.close();
    });
    process.on('SIGTERM', () => {
      void app.close();
    });
  }
}

