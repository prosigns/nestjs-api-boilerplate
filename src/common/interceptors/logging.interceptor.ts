import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip } = request;
    const requestId = request.requestId ?? '-';
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          this.logger.log(
            `[${requestId}] ${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${userAgent} ${ip}`,
          );
        },
        error: (error: Error) => {
          const response = context.switchToHttp().getResponse<Response>();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - startTime;

          this.logger.error(
            `[${requestId}] ${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${userAgent} ${ip} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
} 