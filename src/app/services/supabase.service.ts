import { Injectable } from '@angular/core';
import { createClient, PostgrestError, SupabaseClient} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment.prod';
import { Bank } from '../models/bank.model';
import { Credit } from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient

  constructor() { 
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }
  login (email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async getInformationBank(): Promise<{ data?: Bank[], error?: PostgrestError }> {
    const { data, error } = await this.supabase
      .from('bank')
      .select('*');
    return { data, error };
  }

  subscribeToBankChanges(callback: (payload: any) => void) {
    const channel = this.supabase.channel('public:bank');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bank' },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Suscripción a cambios en la tabla bank activa.');
        }
      });

    return channel;
  }

  async getCredits(): Promise<{ data?: Credit[], error?: PostgrestError }> {
    const { data, error } = await this.supabase
      .from('credits')
      .select('*');
    return { data, error };
  }

  subscribeToCreditChanges(callback: (payload: any) => void) {
    const channel = this.supabase.channel('public:credits');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credits' },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Suscripción a cambios en la tabla credits activa.');
        }
      });

    return channel;
  }
}
