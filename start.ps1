$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/enterprise_db?schema=public"
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:JWT_SECRET = "your-jwt-secret-key-change-in-production"
$env:JWT_EXPIRES_IN = "15m"
$env:JWT_REFRESH_SECRET = "your-refresh-token-secret-key-change-in-production"
$env:JWT_REFRESH_EXPIRES_IN = "7d"

npm run start 