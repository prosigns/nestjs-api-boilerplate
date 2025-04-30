import { Injectable, OnModuleInit } from '@nestjs/common';
import { MySqlRepository } from '../../../common/database/repository/mysql.repository';
import { TypeOrmService } from '../../../common/database/typeorm/typeorm.service';
import { TypeOrmUser } from '../entities/user.typeorm.entity';

@Injectable()
export class MySqlUserRepository extends MySqlRepository<TypeOrmUser> implements OnModuleInit {
  constructor(protected readonly typeOrmService: TypeOrmService) {
    super(typeOrmService, TypeOrmUser);
  }

  async onModuleInit() {
    await super.onModuleInit();
  }
} 