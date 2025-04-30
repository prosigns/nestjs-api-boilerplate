import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseRepository } from './base.repository';

@Injectable()
export abstract class SupabaseRepository<T> implements BaseRepository<T> {
  constructor(
    protected readonly supabaseService: SupabaseService,
    private readonly tableName: string,
  ) {}

  async create(data: any): Promise<T> {
    const { data: result, error } = await this.supabaseService.client
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result as T;
  }

  async findAll(skip = 0, take = 10): Promise<T[]> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .range(skip, skip + take - 1);
      
    if (error) throw error;
    return data as T[];
  }

  async findOne(id: string): Promise<T> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) throw new NotFoundException(`${this.tableName} with ID ${id} not found`);
    
    return data as T;
  }

  async findByField(field: string, value: any): Promise<T> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .eq(field, value)
      .single();
      
    if (error) throw error;
    if (!data) throw new NotFoundException(`${this.tableName} with ${field} ${value} not found`);
    
    return data as T;
  }

  async update(id: string, data: any): Promise<T> {
    const { data: result, error } = await this.supabaseService.client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return result as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from(this.tableName)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
} 