import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export abstract class PrismaRepository<T> implements BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string,
  ) {}

  async create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  async findAll(skip = 0, take = 10): Promise<T[]> {
    return this.prisma[this.modelName].findMany({ skip, take });
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.prisma[this.modelName].findUnique({
      where: { id },
    });
    
    if (!entity) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
    
    return entity;
  }

  async findByField(field: string, value: any): Promise<T> {
    const entity = await this.prisma[this.modelName].findUnique({
      where: { [field]: value },
    });
    
    if (!entity) {
      throw new NotFoundException(`${this.modelName} with ${field} ${value} not found`);
    }
    
    return entity;
  }

  async update(id: string, data: any): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma[this.modelName].delete({
      where: { id },
    });
  }
} 