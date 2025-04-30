import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from './supabase/supabase.service';
import { TypeOrmService } from './typeorm/typeorm.service';
import { DatabaseAdapterFactory } from './database-adapter.factory';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
          connectionName: 'defaultConnection',
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const dbType = configService.get<string>('database.type');
            
            if (dbType === 'mongodb') {
              return {
                uri: configService.get<string>('database.mongoUri'),
                useNewUrlParser: true,
                useUnifiedTopology: true,
              };
            }
            // Return empty config for Mongoose when not using MongoDB
            return {
              uri: 'mongodb://dummy:dummy@localhost:27017/dummy',
              useNewUrlParser: true,
              useUnifiedTopology: true,
            };
          },
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const dbType = configService.get<string>('database.type');
            
            if (dbType === 'mysql') {
              return {
                type: 'mysql',
                host: configService.get<string>('database.mysqlHost'),
                port: configService.get<number>('database.mysqlPort'),
                username: configService.get<string>('database.mysqlUsername'),
                password: configService.get<string>('database.mysqlPassword'),
                database: configService.get<string>('database.mysqlDatabase'),
                entities: [__dirname + '/../../../**/*.typeorm.entity{.ts,.js}'],
                synchronize: configService.get<boolean>('database.mysqlSynchronize'),
              };
            }
            // Return dummy TypeORM config when not using MySQL
            return {
              type: 'mysql',
              host: 'localhost',
              port: 3306,
              username: 'dummy',
              password: 'dummy',
              database: 'dummy',
              entities: [],
              synchronize: false,
            };
          },
        }),
        PrismaModule,
      ],
      providers: [SupabaseService, TypeOrmService, DatabaseAdapterFactory],
      exports: [PrismaModule, MongooseModule, SupabaseService, TypeOrmService, DatabaseAdapterFactory],
    };
  }
} 