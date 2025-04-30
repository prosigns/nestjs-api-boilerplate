import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmService implements OnModuleInit {
  private _dataSource: DataSource;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dbType = this.configService.get<string>('database.type');
    
    if (dbType !== 'mysql') {
      return;
    }
    
    this._dataSource = new DataSource({
      type: 'mysql',
      host: this.configService.get<string>('database.mysqlHost'),
      port: this.configService.get<number>('database.mysqlPort'),
      username: this.configService.get<string>('database.mysqlUsername'),
      password: this.configService.get<string>('database.mysqlPassword'),
      database: this.configService.get<string>('database.mysqlDatabase'),
      entities: [__dirname + '/../../../**/*.typeorm.entity{.ts,.js}'],
      synchronize: this.configService.get<boolean>('database.mysqlSynchronize'),
    });

    await this._dataSource.initialize();
  }

  get dataSource(): DataSource {
    return this._dataSource;
  }
} 