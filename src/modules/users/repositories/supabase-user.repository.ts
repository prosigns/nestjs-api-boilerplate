import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../../../common/database/repository/supabase.repository';
import { SupabaseService } from '../../../common/database/supabase/supabase.service';

@Injectable()
export class SupabaseUserRepository extends SupabaseRepository<any> {
  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService, 'users');
  }
} 