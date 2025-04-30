import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Document } from 'mongoose';
import { BaseRepository } from './base.repository';

@Injectable()
export abstract class MongoRepository<T extends Document> implements BaseRepository<T> {
  protected model: Model<T>;

  setModel(model: Model<T>) {
    this.model = model;
  }

  async create(data: any): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  async findAll(skip = 0, take = 10): Promise<T[]> {
    return this.model.find().skip(skip).limit(take).exec();
  }

  async findOne(id: string): Promise<T> {
    const result = await this.model.findById(id).exec();
    if (!result) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return result as unknown as T;
  }

  async findByField(field: string, value: any): Promise<T> {
    const query: any = {};
    query[field] = value;
    
    const result = await this.model.findOne(query).exec();
    if (!result) {
      throw new NotFoundException(`Entity with ${field} ${value} not found`);
    }
    return result as unknown as T;
  }

  async update(id: string, data: any): Promise<T> {
    const result = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!result) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return result as unknown as T;
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }
} 