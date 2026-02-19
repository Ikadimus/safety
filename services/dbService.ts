
import { supabase } from '../lib/supabase';
import { Provider, Employee, Document, DocStatus, ProviderStatus, TrainingType } from '../types';

export const dbService = {
  async getFullProvidersData(): Promise<Provider[]> {
    const savedPeriod = localStorage.getItem('biosafety_alert_period');
    const alertThreshold = savedPeriod ? parseInt(savedPeriod, 10) : 30;

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

    if (error) throw error;

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
          
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);

          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let status: DocStatus = DocStatus.VALID;
          if (diffDays < 0) {
            status = DocStatus.EXPIRED;
          } else if (diffDays <= alertThreshold) {
            status = DocStatus.EXPIRING;
          }

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

  async updateProvider(id: string, updates: { name: string, cnpj: string, contact_email: string }) {
    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteProvider(id: string) {
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createEmployee(employee: { name: string, cpf: string, role: string, provider_id: string }) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateEmployee(id: string, updates: { name: string, cpf: string, role: string }) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createDocument(document: { employee_id: string, type: string, issue_date: string, expiry_date: string }) {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteDocument(id: string) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  },

  async getTrainingTypes(): Promise<TrainingType[]> {
    try {
      const { data, error } = await supabase
        .from('training_types')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch {
      return [
        { id: '1', name: 'NR-01' },
        { id: '2', name: 'NR-06' },
        { id: '3', name: 'NR-10' },
        { id: '4', name: 'NR-20' },
        { id: '5', name: 'NR-33' },
        { id: '6', name: 'NR-35' },
        { id: '7', name: 'ASO' }
      ];
    }
  },

  async addTrainingType(name: string, parentId: string | null = null) {
    const { data, error } = await supabase
      .from('training_types')
      .insert([{ name, parent_id: parentId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateTrainingType(id: string, name: string) {
    const { error } = await supabase
      .from('training_types')
      .update({ name })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteTrainingType(id: string) {
    const { error } = await supabase
      .from('training_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
