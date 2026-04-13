import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  // Central place to load env and config. Keeping it minimal now; add schema validation later if needed.
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      // In tests we avoid accidental .env usage unless explicitly set.
      ignoreEnvFile: isTest,
    }),
  ],
})
export class ConfigModule {}
