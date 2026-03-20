import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*' });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Flourisher backend listening on http://0.0.0.0:${port}/api`);
}

bootstrap();
