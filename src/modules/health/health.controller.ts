import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@SkipThrottle({ default: true, auth: true })
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness — process is running' })
  @ApiResponse({ status: 200, description: 'API is up' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'API is up' })
  live() {
    return this.check();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness — database is reachable' })
  @ApiResponse({ status: 200, description: 'Dependencies OK' })
  @ApiResponse({ status: 503, description: 'Dependency unavailable' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        checks: { database: 'up' },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: { database: 'down' },
      });
    }
  }
}
