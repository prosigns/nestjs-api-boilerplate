import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from './supabase/supabase.service';
import { TypeOrmService } from './typeorm/typeorm.service';
import { DatabaseAdapterFactory } from './database-adapter.factory';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule, PrismaModule],
      providers: [SupabaseService, TypeOrmService, DatabaseAdapterFactory],
      exports: [PrismaModule, SupabaseService, TypeOrmService, DatabaseAdapterFactory],
    };
  }
} 