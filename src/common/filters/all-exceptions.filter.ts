import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Log the exception details
    this.logger.error(
      `Exception: ${
        exception instanceof Error ? exception.message : 'Unknown error'
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    let status: number;
    let message: string;
    let error: string;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' 
        ? response 
        : (response as Record<string, any>).message || exception.message;
      error = exception.name;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      message = this.isProduction()
        ? 'A database error occurred'
        : this.handlePrismaError(exception);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = this.isProduction()
        ? 'An unexpected error occurred'
        : exception instanceof Error
          ? exception.message
          : 'Internal Server Error';
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      error,
      message,
      ...(this.isProduction()
        ? {}
        : {
            requestId: (ctx.getRequest() as { requestId?: string }).requestId,
          }),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return `Unique constraint failed on the field: ${error.meta?.target}`;
      case 'P2025':
        return 'Record not found';
      default:
        return `Database error: ${error.message}`;
    }
  }

  private isProduction(): boolean {
    return this.configService.get<string>('app.environment') === 'production';
  }
} 