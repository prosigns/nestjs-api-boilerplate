import * as Joi from 'joi';

/**
 * Validates environment variables at startup.
 * In production, critical secrets and DATABASE_URL are required.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.string().optional(),
  }),

  DATABASE_TYPE: Joi.string()
    .valid('postgres', 'mongodb', 'supabase', 'mysql')
    .default('postgres'),

  JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(32),
    otherwise: Joi.string().optional(),
  }),

  JWT_REFRESH_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(32),
    otherwise: Joi.string().optional(),
  }),

  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  CORS_ORIGINS: Joi.string().default('*'),

  REDIS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  THROTTLE_AUTH_TTL: Joi.number().default(60),
  THROTTLE_AUTH_LIMIT: Joi.number().default(5),

  OTEL_ENABLED: Joi.string().valid('true', 'false').default('false'),

  UPLOAD_DESTINATION: Joi.string().default('./uploads'),
  /** Comma-separated MIME types; empty = use built-in defaults in FilesService */
  ALLOWED_UPLOAD_MIME_TYPES: Joi.string().allow('').optional(),
}).unknown(true);
