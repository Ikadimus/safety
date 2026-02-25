
import { supabase } from '../lib/supabase';
import { Provider, Employee, Document, DocStatus, ProviderStatus } from '../types';

export const dbService = {
  async getFullProvidersData(): Promise<Provider[]> {
    // Busca o período de alerta configurado (padrão 30 dias)
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
          
          // Resetar horas para comparação pura de dias
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

  async getTrainingTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('training_types').select('name').order('name');
      if (error || !data) throw error;
      return data.map((t: any) => t.name);
    } catch {
      return ['NR-01', 'NR-06', 'NR-10', 'NR-20', 'NR-33', 'NR-35', 'ASO'];
    }
  },

  async addTrainingType(name: string) {
    const { error } = await supabase.from('training_types').insert([{ name }]);
    if (error) throw error;
  },

  async deleteTrainingType(name: string) {
    const { error } = await supabase.from('training_types').delete().eq('name', name);
    if (error) throw error;
  },

  // Fleet / Frota Methods
  async getFleetData(): Promise<any[]> {
    const savedPeriod = localStorage.getItem('biosafety_alert_period');
    const alertThreshold = savedPeriod ? parseInt(savedPeriod, 10) : 30;

    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        providers (name),
        vehicle_documents (*)
      `)
      .order('plate');

    if (error) throw error;

    return (data || []).map((v: any) => ({
      ...v,
      providerName: v.providers?.name,
      documents: (v.vehicle_documents || []).map((d: any) => {
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
          description: d.description,
          vehicleId: d.vehicle_id
        };
      })
    }));
  },

  async createVehicle(vehicle: { plate: string, model: string, type: string, provider_id: string, status: string }) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateVehicle(id: string, updates: { plate: string, model: string, type: string, provider_id: string, status: string }) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteVehicle(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createVehicleDocument(document: { vehicle_id: string, type: string, issue_date: string, expiry_date: string }) {
    const { data, error } = await supabase
      .from('vehicle_documents')
      .insert([document])
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteVehicleDocument(id: string) {
    const { error } = await supabase.from('vehicle_documents').delete().eq('id', id);
    if (error) throw error;
  }
};
