import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PublicMetricsController } from './common/metrics/public-metrics.controller';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nModule } from './i18n/i18n.module';
import { I18nMiddleware } from './common/middleware/i18n.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
        convert: true,
      },
    }),
    
    // Rate limiting: `default` (API-wide) + `auth` (stricter on login/register/refresh)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('throttle.ttl') ?? 60,
            limit: configService.get<number>('throttle.limit') ?? 100,
          },
          {
            name: 'auth',
            ttl: configService.get<number>('throttle.authTtl') ?? 60,
            limit: configService.get<number>('throttle.authLimit') ?? 5,
            /** Only rate-limit credential/token refresh routes (not entire /auth/*). */
            skipIf: (context) => {
              const req = context.switchToHttp().getRequest<{
                originalUrl?: string;
                url?: string;
              }>();
              const url = req.originalUrl || req.url || '';
              const isCredentialRoute =
                url.includes('/auth/login') ||
                url.includes('/auth/register') ||
                url.includes('/auth/refresh');
              return !isCredentialRoute;
            },
          },
        ],
      }),
    }),

    PrometheusModule.register({
      path: 'metrics',
      controller: PublicMetricsController,
      defaultMetrics: {
        enabled: true,
      },
    }),
    
    // Caching: Redis when enabled, otherwise in-memory (no Redis dependency at startup)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisEnabled = configService.get<boolean>('redis.enabled');
        if (redisEnabled) {
          return {
            store: redisStore,
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            ttl: 60,
          };
        }
        return {
          ttl: 60,
          max: 100,
        };
      },
    }),
    
    // Logging with Winston
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('app.environment') === 'production';
        return {
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                isProduction
                  ? winston.format.json()
                  : winston.format.prettyPrint(),
              ),
              level: isProduction ? 'info' : 'debug',
            }),
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ],
        };
      },
    }),
    
    // Database
    PrismaModule,

    // i18n
    I18nModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    FilesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, I18nMiddleware)
      .forRoutes('*');
  }
}
