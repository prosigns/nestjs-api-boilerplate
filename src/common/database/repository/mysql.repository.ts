import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { TypeOrmService } from '../typeorm/typeorm.service';
import { BaseRepository } from './base.repository';

@Injectable()
export abstract class MySqlRepository<T extends ObjectLiteral> implements BaseRepository<T> {
  protected repository: Repository<T>;
  protected entity: any;

  constructor(
    protected readonly typeOrmService: TypeOrmService,
    protected readonly entityType: new () => T,
  ) {}

  async onModuleInit() {
    if (this.typeOrmService.dataSource) {
      this.repository = this.typeOrmService.dataSource.getRepository<T>(this.entityType);
    }
  }

  async create(data: any): Promise<T> {
    const entity = this.repository.create(data);
    const savedEntity = await this.repository.save(entity);
    return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
  }

  async findAll(skip = 0, take = 10): Promise<T[]> {
    return this.repository.find({
      skip,
      take,
    });
  }

  async findOne(id: string): Promise<T> {
    const whereOptions = { id } as unknown as FindOptionsWhere<T>;
    const entity = await this.repository.findOne({
      where: whereOptions,
    });
    
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    
    return entity;
  }

  async findByField(field: string, value: any): Promise<T> {
    const whereOptions = { [field]: value } as unknown as FindOptionsWhere<T>;
    const entity = await this.repository.findOne({
      where: whereOptions,
    });
    
    if (!entity) {
      throw new NotFoundException(`Entity with ${field} ${value} not found`);
    }
    
    return entity;
  }

  async update(id: string, data: any): Promise<T> {
    const whereOptions = { id } as unknown as FindOptionsWhere<T>;
    await this.repository.update(whereOptions, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const whereOptions = { id } as unknown as FindOptionsWhere<T>;
    await this.repository.delete(whereOptions);
  }
} 