import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PrismaRepository } from '../../../common/database/repository/prisma.repository';

@Injectable()
export class PrismaUserRepository extends PrismaRepository<any> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'user');
  }
} 