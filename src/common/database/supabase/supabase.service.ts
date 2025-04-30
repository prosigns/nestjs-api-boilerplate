import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('database.supabaseUrl');
    const supabaseKey = this.configService.get<string>('database.supabaseKey');
    
    if (!supabaseUrl || !supabaseKey) {
      return;
    }
    
    this._client = createClient(supabaseUrl, supabaseKey);
  }

  get client(): SupabaseClient {
    return this._client;
  }
} 