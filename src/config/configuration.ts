import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  /** Comma-separated origins, or `*` to reflect any origin (dev only recommended) */
  corsOrigins: process.env.CORS_ORIGINS || '*',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  type: process.env.DATABASE_TYPE || 'postgres',
  mongoUri: process.env.MONGODB_URI,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  mysqlHost: process.env.MYSQL_HOST || 'localhost',
  mysqlPort: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  mysqlUsername: process.env.MYSQL_USERNAME || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || 'password',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'api',
  mysqlSynchronize: process.env.MYSQL_SYNCHRONIZE === 'true',
}));

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const redisConfig = registerAs('redis', () => ({
  enabled: process.env.REDIS_ENABLED !== 'false',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));

export const filesConfig = registerAs('files', () => ({
  uploadDestination: process.env.UPLOAD_DESTINATION || './uploads',
  /** Comma-separated list; if empty, FilesService uses a safe default set */
  allowedMimeTypes: process.env.ALLOWED_UPLOAD_MIME_TYPES || '',
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  /** Stricter bucket for auth routes (login / register / refresh) */
  authTtl: parseInt(process.env.THROTTLE_AUTH_TTL || '60', 10),
  authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10),
}));

export const messagingConfig = registerAs('messaging', () => ({
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
}));

export default [
  appConfig,
  databaseConfig,
  authConfig,
  redisConfig,
  filesConfig,
  throttleConfig,
  messagingConfig,
]; 