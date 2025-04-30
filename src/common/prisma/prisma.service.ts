import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Clear tables in the correct order to respect foreign key constraints
    const modelsToClear = ['file', 'user'];
    
    return Promise.all(
      modelsToClear.map(async (modelName) => {
        if (modelName === 'file' && this.file) {
          return this.file.deleteMany();
        }
        if (modelName === 'user' && this.user) {
          return this.user.deleteMany();
        }
        return;
      }),
    );
  }
} 