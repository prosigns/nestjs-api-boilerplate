# Enterprise Nest Js API Boilerplate

An enterprise-grade NestJS API boilerplate with built-in features for modern backend applications, developed by [Prosigns](https://www.prosignstech.com/).

## About Prosigns Technologies

Prosigns Technologies is a leading provider of custom software development services in the USA, Canada, and Middle East. With a team of 135+ tech innovators, Prosigns specializes in:

- Business Enablement: Strategic solutions that drive operational efficiency and market expansion
- Artificial Intelligence: Turning data into actionable insights and competitive advantage
- Digital Transformation: Empowering businesses to thrive in the digital era
- Engineering: Precision-driven solutions for seamless performance and scalability

Prosigns offers services across diverse industries including SaaS, Healthcare, Finance, Oil and Gas, Logistics, Real Estate, and more. The company is dedicated to delivering high-quality, tailored tech solutions that strengthen core business functions and unlock new digital possibilities.

For more information, visit [prosignstech.com](https://www.prosignstech.com/) or contact them at:
- Email: services@prosignstech.com
- US: +1 469 663 3444

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- **Database Integration**: 
  - Prisma ORM with PostgreSQL
  - MongoDB with Mongoose
  - MySQL with TypeORM
  - Supabase cloud database
- **Configuration Management**: Environment-specific configuration using NestJS ConfigModule
- **Logging & Error Handling**: Centralized logging with Winston and global error handling
- **Validation**: Class-validator and class-transformer for request validation
- **Testing**: Jest configuration for unit and integration tests
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Dockerfile and docker-compose for easy containerization
- **Code Quality**: ESLint and Prettier configuration
- **File Uploads**: File upload support with local storage
- **Caching**: Redis caching
- **Message Queues**: RabbitMQ integration
- **Security**: Security headers with Helmet, CORS support
- **Internationalization**: i18n support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for container-based setup)
- Database of your choice (PostgreSQL, MongoDB, MySQL, or Supabase account)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd enterprise-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit the .env file with your configuration
```

4. If using PostgreSQL with Prisma, generate Prisma client
```bash
npx prisma generate
```

5. If using PostgreSQL with Prisma, run migrations
```bash
npx prisma migrate dev
```

### Running the application

#### Development mode
```bash
npm run start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
```

#### Using Docker
```bash
docker-compose up -d
```

## API Documentation

When running in development mode, you can access the Swagger API documentation at:
```
http://localhost:3000/api/docs
```

## Multi-Database Support

This API boilerplate offers a flexible database architecture that allows you to switch between multiple database providers:

### Supported Databases

1. **PostgreSQL** (via Prisma ORM) - Default and fully functional
2. **MongoDB** (via Mongoose ODM) - Temporarily disabled, falls back to PostgreSQL
3. **MySQL** (via TypeORM) 
4. **Supabase** (via Supabase SDK)

### How to Configure

Configure your database type in the `.env` file:

```
DATABASE_TYPE=postgres  # Options: 'postgres', 'mongodb', 'supabase', 'mysql'
```

Then provide the connection details for your chosen database:

#### PostgreSQL (Prisma)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/api
```

#### MongoDB
```
MONGODB_URI=mongodb://username:password@localhost:27017/api
```

> **Note:** MongoDB support is temporarily disabled in the current implementation. When MongoDB is selected, the system will fall back to using PostgreSQL. This is being addressed in an upcoming update.

#### MySQL
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=api
MYSQL_SYNCHRONIZE=true
```

#### Supabase
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Architecture

The multi-database architecture uses:

- **Repository Pattern**: Generic interface for database operations through `BaseRepository<T>`
- **Factory Pattern**: Selects the appropriate repository implementation at runtime via `UserRepositoryFactory`
- **Database-specific implementations**: Each database provider has its own implementation of the repository interface

This abstraction allows the application to switch between database providers by simply changing the `DATABASE_TYPE` environment variable, without modifying any business logic code.

### Current Implementation Status

- **PostgreSQL**: Fully implemented and functioning as the default database
- **MongoDB**: Implementation is complete but currently disabled due to connection issues; falls back to PostgreSQL
- **MySQL**: Implementation is complete through TypeORM
- **Supabase**: Implementation is complete through Supabase SDK

To switch databases, change the `DATABASE_TYPE` value in your `.env` file and ensure the corresponding connection details are properly configured.

## Project Structure

```
├── prisma/                     # Prisma schema and migrations
├── src/
│   ├── common/                 # Common code shared across the application
│   │   ├── database/           # Database abstraction layer
│   │   │   ├── repository/     # Repository interfaces and implementations
│   │   │   ├── supabase/       # Supabase service
│   │   │   ├── typeorm/        # TypeORM service
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Authentication and authorization guards
│   │   ├── interceptors/       # Request/response interceptors
│   │   ├── middleware/         # HTTP middleware
│   │   ├── prisma/             # Prisma service
│   ├── config/                 # Application configuration
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   ├── files/              # File upload module
│   │   ├── health/             # Health check module
│   │   ├── users/              # User management module
│   │   │   ├── repositories/   # Database repositories for users
│   │   │   ├── schemas/        # MongoDB schemas
│   │   │   ├── entities/       # Entities for different ORMs
│   ├── app.controller.ts       # Main app controller
│   ├── app.module.ts           # Main app module
│   ├── app.service.ts          # Main app service
│   ├── main.ts                 # Application entry point
├── test/                       # End-to-end tests
├── .env                        # Environment variables
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Docker configuration
├── jest.config.js              # Jest configuration
├── nest-cli.json               # NestJS CLI configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Testing

### Unit tests
```bash
npm run test
```

### End-to-end tests
```bash
npm run test:e2e
```

### Test coverage
```bash
npm run test:cov
```

## Authentication

The API uses JWT for authentication. To use the protected endpoints:

1. Register a user or login with credentials to get an access token
2. Include the token in the Authorization header:
```
Authorization: Bearer your-access-token
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
