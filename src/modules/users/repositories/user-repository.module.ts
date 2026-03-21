import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserRepositoryFactory } from './user-repository.factory';
import { PrismaUserRepository } from './prisma-user.repository';
import { MongoUserRepository } from './mongo-user.repository';
import { SupabaseUserRepository } from './supabase-user.repository';
import { MySqlUserRepository } from './mysql-user.repository';
import { DatabaseModule } from '../../../common/database/database.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    ConfigModule,
  ],
  providers: [
    UserRepositoryFactory,
    PrismaUserRepository,
    MongoUserRepository,
    SupabaseUserRepository,
    MySqlUserRepository,
  ],
  exports: [UserRepositoryFactory],
})
export class UserRepositoryModule {} 