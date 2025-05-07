import { Injectable } from '@angular/core';
import { createClient, PostgrestError, SupabaseClient} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Bank } from '../models/bank.model';
import { Credit } from '../models/credit.model';
import { Charge } from '../models/charge';

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
  async getInformationCredit(): Promise<{ data?: Credit[], error?: PostgrestError }> {
    const { data, error } = await this.supabase
      .from('credits')
      .select('*');
    return { data, error };
  }
  async getInformationCharges(): Promise<{ data?: Charge[], error?: PostgrestError }> {
    const { data, error } = await this.supabase
      .from('charges')
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

  async getChargesForCredit(id: Number)
    : Promise<{ data?: Charge[]; error?: PostgrestError }> {

    const { data, error } = await this.supabase
      .from('credito_cobro')
      .select('charges(*)')
      .eq('credito_id', id);

    if (error) {
      return { error };
    }
    if (!data) {
      return { data: [] };
    }

    const charges: Charge[] = data
      .map(row => row.charges)    
      .flat();                  
    return { data: charges };
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
  async updateBank(id:Number , datos:Partial<Bank>){
    const { error } = await this.supabase
      .from('bank')
      .update(datos)
      .eq('id', id);

    return error;
  }
  async updateCredit(id:number , datos:Partial<Credit>){
    const { error } = await this.supabase
      .from('credits')
      .update(datos)
      .eq('id', id);

    return error;
  }
  async updateCharge(id:number , datos:Partial<Charge>){
    const { error } = await this.supabase
      .from('charges')
      .update(datos)
      .eq('id', id);

    return error;
  }
async uploadImage(bucket: string, path: string, file: File): Promise<{ url?: string; error?: any }> {
  const { data, error } = await this.supabase
    .storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) return { error };

  const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(path);
  return { url: publicUrlData.publicUrl };
}
async deleteCredit(id: number): Promise<any> {
  const { error: errorCobros } = await this.supabase
    .from('credito_cobro')
    .delete()
    .eq('credito_id', id);

  if (errorCobros) {
    return { error: 'Error al eliminar las relaciones de cobros', details: errorCobros };
  }

  const { error } = await this.supabase.from('credits').delete().eq('id', id);

  return error ? { error: 'Error al eliminar el crédito', details: error } : { success: true };
}

async deleteCharge(id: number) {
  const { error } = await this.supabase.from('charges').delete().eq('id', id);
  return error;
}

async insertCredit(credito: any): Promise<{ data: { id: number }[]; error: any }> {
  const { data, error } = await this.supabase.from('credits').insert([credito]).select();
  return { data: data ?? [], error };
}

async insertCharge(cobro: any) {
  const { error } = await this.supabase.from('charges').insert([cobro]);
  return { error };
}

async getCobrosDeCredito(creditoId: number) {
  return this.supabase
    .from('credito_cobro')
    .select('cobro_id')
    .eq('credito_id', creditoId);
}

async actualizarCobrosCredito(creditId: number, cobros: number[]) {
  await this.supabase
    .from('credito_cobro')
    .delete()
    .eq('credito_id', creditId);

  const relaciones = cobros.map(cobroId => ({
    credito_id: creditId,
    cobro_id: cobroId
  }));
  console.log('Relaciones a insertar en credito_cobro:', relaciones);

  const { error } = await this.supabase
    .from('credito_cobro')
    .insert(relaciones);
    if (error) {
      console.error('Error al insertar en credito_cobro:', error.message);
    }

  return error;
}
async getCobrosForCredit(creditId: number): Promise<any[]> {
  const { data: cobrosIntermedios, error: cobrosError } = await this.supabase
    .from('credito_cobro')
    .select('cobro_id')
    .eq('credito_id', creditId);

  if (cobrosError) {
    return [];
  }

  const cobrosDetallesPromises = cobrosIntermedios.map(async (cobroIntermedio: any) => {
    const { data: cobro, error: cobroError } = await this.supabase
      .from('charges')
      .select('*')
      .eq('id', cobroIntermedio.cobro_id)
      .single();

    if (cobroError) {
      return null;
    }

    return cobro;
  });

  const cobros = await Promise.all(cobrosDetallesPromises);

  return cobros.filter(cobro => cobro !== null);
}

// Metodos Inversiones
async getInvestments(): Promise<{ data?: any[], error?: any }> {
  const { data, error } = await this.supabase
    .from('investments')
    .select('*');
  return { data, error };
}
// Obtener Inversion por ID
async getInvestmentById(id: string): Promise<{ data?: any, error?: any }> {
  const { data, error } = await this.supabase
    .from('investments')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}
// Crear Inversion
async createInvestment(investmentData: {
  investment_type: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
}): Promise<{ data?: any, error?: any }> {
  const { data, error } = await this.supabase
    .from('investments')
    .insert([investmentData])
    .select();
  return { data: data ? data[0] : null, error };
}
//Actualizar Inversion
async updateInvestment(
  id: string,
  updateData: Partial<{
    investment_type: string;
    interest_rate: number;
    min_amount: number;
    max_amount: number;
    min_duration: number;
    max_duration: number;
  }>
): Promise<{ error?: any }> {
  const { error } = await this.supabase
    .from('investments')
    .update(updateData)
    .eq('id', id);
  return { error };
}
//Eliminar Inversion
async deleteInvestment(id: string): Promise<{ error?: any }> {
  const { error } = await this.supabase
    .from('investments')
    .delete()
    .eq('id', id);
  return { error };
}

subscribeToInvestmentsChanges(callback: (payload: any) => void) {
  return this.supabase
    .channel('public:investments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'investments' },
      callback
    )
    .subscribe();
}

}
