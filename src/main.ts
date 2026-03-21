import './telemetry/sdk-init';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as compression from 'compression';
import * as cors from 'cors';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.prettyPrint(),
        ),
      }),
    ],
  });

  try {
    const app = await NestFactory.create(AppModule, {
      logger,
    });

    app.enableShutdownHooks();

    const configService = app.get(ConfigService);
    const port = configService.get<number>('app.port');
    const environment = configService.get<string>('app.environment');
    const corsOrigins = configService.get<string>('app.corsOrigins') || '*';

    app.setGlobalPrefix('api');

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    const origin =
      corsOrigins === '*'
        ? true
        : corsOrigins.split(',').map((o) => o.trim()).filter(Boolean);

    app.use(
      cors({
        origin,
        credentials: true,
      }),
    );

    app.use(helmet());
    app.use(compression());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Enterprise API')
        .setDescription('Enterprise-grade API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    }

    await app.listen(port ?? 3000);
    logger.log(
      `Application is running on port ${port} in ${environment} mode`,
    );
  } catch (error) {
    logger.error(
      `Bootstrap failed: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error.stack : undefined,
    );
    process.exit(1);
  }
}

bootstrap();
