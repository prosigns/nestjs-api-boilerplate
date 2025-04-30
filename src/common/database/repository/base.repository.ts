export interface BaseRepository<T> {
  create(data: any): Promise<T>;
  findAll(skip?: number, take?: number): Promise<T[]>;
  findOne(id: string): Promise<T>;
  findByField(field: string, value: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
} 