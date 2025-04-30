import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { User, UserSchema } from '../schemas/user.schema';
import { UserRepositoryFactory } from './user-repository.factory';
import { PrismaUserRepository } from './prisma-user.repository';
import { MongoUserRepository } from './mongo-user.repository';
import { SupabaseUserRepository } from './supabase-user.repository';
import { MySqlUserRepository } from './mysql-user.repository';
import { DatabaseModule } from '../../../common/database/database.module';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    // Temporarily commenting out Mongoose module to bypass connection issues
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'defaultConnection'),
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