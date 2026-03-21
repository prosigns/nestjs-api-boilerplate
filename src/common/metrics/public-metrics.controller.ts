import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { register } from 'prom-client';
import { Public } from '../decorators/public.decorator';

/**
 * Prometheus scrape endpoint (must stay public — no JWT).
 * Mounted path is configured via `PrometheusModule.register({ path })`.
 */
@SkipThrottle({ default: true, auth: true })
@Public()
@Controller()
export class PublicMetricsController {
  @Get()
  async index(@Res({ passthrough: true }) res: Response) {
    res.header('Content-Type', register.contentType);
    return register.metrics();
  }
}
