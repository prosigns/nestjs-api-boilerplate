import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { BaseRepository } from '../../../common/database/repository/base.repository';
import { PrismaUserRepository } from './prisma-user.repository';
import { MongoUserRepository } from './mongo-user.repository';
import { SupabaseUserRepository } from './supabase-user.repository';
import { MySqlUserRepository } from './mysql-user.repository';
import { DatabaseType } from '../../../common/database/database-adapter.factory';

@Injectable()
export class UserRepositoryFactory {
  constructor(
    private configService: ConfigService,
    private prismaUserRepository: PrismaUserRepository,
    private mongoUserRepository: MongoUserRepository,
    private supabaseUserRepository: SupabaseUserRepository,
    private mySqlUserRepository: MySqlUserRepository,
    // Commenting out the MongoDB model injection to avoid connection issues
    // @InjectModel(User.name, 'defaultConnection') private userModel: Model<User>,
  ) {}

  getRepository(): BaseRepository<any> {
    const dbType = this.configService.get<string>('database.type');
    
    switch (dbType) {
      case DatabaseType.MONGODB:
        // Temporarily return Prisma repository instead of MongoDB
        console.warn('MongoDB support is temporarily disabled, using Prisma instead');
        return this.prismaUserRepository;
        // this.mongoUserRepository.setModel(this.userModel);
        // return this.mongoUserRepository;
      case DatabaseType.SUPABASE:
        return this.supabaseUserRepository;
      case DatabaseType.MYSQL:
        return this.mySqlUserRepository;
      default:
        return this.prismaUserRepository;
    }
  }
} 