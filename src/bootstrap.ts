import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';
import { validationPipe } from './app.validation.pipe';

export async function bootstrap(): Promise<INestApplication> {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalPipes(validationPipe);
  await app.listen(env["PORT"] || 8084);
  return app;
}