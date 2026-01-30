
import { supabase } from '../lib/supabase';
import { Provider, Employee, Document, DocStatus, ProviderStatus } from '../types';

export const dbService = {
  async getFullProvidersData(): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        employees (
          *,
          documents (*)
        )
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
      throw error;
    }

    return (data || []).map((p: any) => ({
      ...p,
      status: p.status as ProviderStatus,
      contactEmail: p.contact_email,
      employees: (p.employees || []).map((e: any) => ({
        ...e,
        documents: (e.documents || []).map((d: any) => {
          const expiryDate = new Date(d.expiry_date);
          const today = new Date();
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: DocStatus = DocStatus.VALID;
          if (diffDays < 0) status = DocStatus.EXPIRED;
          else if (diffDays <= 30) status = DocStatus.EXPIRING;

          return {
            ...d,
            status,
            issueDate: d.issue_date,
            expiry_date: d.expiry_date
          };
        })
      }))
    })) as Provider[];
  },

  async createProvider(provider: { name: string, cnpj: string, contact_email: string }) {
    const { data, error } = await supabase
      .from('providers')
      .insert([provider])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async createEmployee(employee: { name: string, cpf: string, role: string, provider_id: string }) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select();

    if (error) throw error;
    return data[0];
  },

  async createDocument(document: { employee_id: string, type: string, issue_date: string, expiry_date: string }) {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Gerenciamento de Tipos de Treinamento (Configurações)
  async getTrainingTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('training_types')
      .select('name')
      .order('name');
    
    if (error) {
      console.warn("Tabela training_types não encontrada, usando fallback.");
      return [
        'NR-01 (Integração)', 'NR-06 (EPI)', 'NR-10 (Elétrica)', 
        'NR-33 (Confinado)', 'NR-35 (Altura)', 'ASO'
      ];
    }
    return data.map((t: any) => t.name);
  },

  async addTrainingType(name: string) {
    const { error } = await supabase
      .from('training_types')
      .insert([{ name }]);
    if (error) throw error;
  },

  async deleteTrainingType(name: string) {
    const { error } = await supabase
      .from('training_types')
      .delete()
      .eq('name', name);
    if (error) throw error;
  }
};
