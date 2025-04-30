import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from './supabase/supabase.service';
import { TypeOrmService } from './typeorm/typeorm.service';

export enum DatabaseType {
  POSTGRES = 'postgres',
  MONGODB = 'mongodb',
  SUPABASE = 'supabase',
  MYSQL = 'mysql',
}

@Injectable()
export class DatabaseAdapterFactory {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private supabaseService: SupabaseService,
    private typeOrmService: TypeOrmService,
  ) {}

  getDbType(): DatabaseType {
    return this.configService.get<DatabaseType>('database.type', DatabaseType.POSTGRES);
  }

  getAdapter() {
    const dbType = this.getDbType();
    
    switch (dbType) {
      case DatabaseType.SUPABASE:
        return this.supabaseService;
      case DatabaseType.MYSQL:
        return this.typeOrmService;
      case DatabaseType.POSTGRES:
      default:
        return this.prismaService;
    }
    // MongoDB is handled at repository level through the Mongoose model
  }
} 