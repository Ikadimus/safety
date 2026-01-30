
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
          const expiryDateStr = d.expiry_date || d.expiryDate;
          const expiryDate = expiryDateStr ? new Date(expiryDateStr) : new Date();
          const today = new Date();
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: DocStatus = DocStatus.VALID;
          if (diffDays < 0) status = DocStatus.EXPIRED;
          else if (diffDays <= 30) status = DocStatus.EXPIRING;

          return {
            id: d.id,
            type: d.type,
            issueDate: d.issue_date || d.issueDate,
            expiryDate: expiryDateStr,
            status,
            fileUrl: d.file_url || d.fileUrl,
            description: d.description
          } as Document;
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

  async getTrainingTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('training_types')
        .select('name')
        .order('name');
      
      if (error || !data) throw error;
      return data.map((t: any) => t.name);
    } catch (err) {
      console.warn("Usando lista padrão de NRs para Biometano.");
      return [
        'NR-01 (Integração)', 
        'NR-06 (EPI)', 
        'NR-10 (Elétrica)', 
        'NR-13 (Pressão)',
        'NR-20 (Inflamáveis)',
        'NR-33 (Confinado)', 
        'NR-35 (Altura)', 
        'ASO', 
        'Detectores H2S'
      ];
    }
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
