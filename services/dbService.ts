
import { supabase } from '../lib/supabase';
import { Provider, Employee, Document, DocStatus, ProviderStatus } from '../types';

const mapDocument = (d: any, alertThreshold: number): Document => {
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
};

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
        ),
        provider_documents (*)
      `)
      .order('name');

    if (error) throw error;

    return (data || []).map((p: any) => ({
      ...p,
      status: p.status as ProviderStatus,
      contactEmail: p.contact_email,
      documents: (p.provider_documents || []).map((d: any) => mapDocument(d, alertThreshold)),
      employees: (p.employees || []).map((e: any) => ({
        ...e,
        documents: (e.documents || []).map((d: any) => mapDocument(d, alertThreshold))
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

  async getInternalEmployees(): Promise<Employee[]> {
    const savedPeriod = localStorage.getItem('biosafety_alert_period');
    const alertThreshold = savedPeriod ? parseInt(savedPeriod, 10) : 30;

    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        documents (*)
      `)
      .eq('is_internal', true)
      .order('name');

    if (error) throw error;

    return (data || []).map((e: any) => ({
      ...e,
      isInternal: e.is_internal,
      street: e.street,
      number: e.number,
      neighborhood: e.neighborhood,
      city: e.city,
      state: e.state,
      phone: e.phone,
      emergencyPhone: e.emergency_phone,
      department: e.department,
      hiringDate: e.hiring_date,
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
    })) as Employee[];
  },

  async createEmployee(employee: { 
    name: string, 
    cpf: string, 
    role: string, 
    provider_id?: string, 
    is_internal?: boolean,
    street?: string,
    number?: string,
    neighborhood?: string,
    city?: string,
    state?: string,
    phone?: string,
    emergency_phone?: string,
    department?: string,
    hiring_date?: string
  }) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateEmployee(id: string, updates: { 
    name: string, 
    cpf: string, 
    role: string,
    street?: string,
    number?: string,
    neighborhood?: string,
    city?: string,
    state?: string,
    phone?: string,
    emergency_phone?: string,
    department?: string,
    hiring_date?: string
  }) {
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

  async createProviderDocument(document: { provider_id: string, type: string, issue_date: string, expiry_date: string }) {
    const { data, error } = await supabase
      .from('provider_documents')
      .insert([document])
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteProviderDocument(id: string) {
    const { error } = await supabase.from('provider_documents').delete().eq('id', id);
    if (error) throw error;
  },

  async getProviderDocTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('provider_doc_types').select('name').order('name');
      if (error || !data) throw error;
      return data.map((t: any) => t.name);
    } catch {
      return ['Contrato Social', 'Certidão Negativa', 'Seguro de Vida', 'PGR', 'PCMSO', 'LTCAT'];
    }
  },

  async addProviderDocType(name: string) {
    const { error } = await supabase.from('provider_doc_types').insert([{ name }]);
    if (error) throw error;
  },

  async deleteProviderDocType(name: string) {
    const { error } = await supabase.from('provider_doc_types').delete().eq('name', name);
    if (error) throw error;
  },

  async getInternalDocTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('internal_doc_types').select('name').order('name');
      if (error || !data) throw error;
      return data.map((t: any) => t.name);
    } catch {
      return ['RG/CNH', 'CPF', 'ASO', 'PGR', 'Atestado de Antecedentes', 'Comprovante Residência'];
    }
  },

  async addInternalDocType(name: string) {
    const { error } = await supabase.from('internal_doc_types').insert([{ name }]);
    if (error) throw error;
  },

  async deleteInternalDocType(name: string) {
    const { error } = await supabase.from('internal_doc_types').delete().eq('name', name);
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
        vehicle_documents (*),
        vehicle_maintenances (*)
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
      }),
      maintenances: (v.vehicle_maintenances || []).map((m: any) => ({
        id: m.id,
        vehicleId: m.vehicle_id,
        problemDescription: m.problem_description,
        maintenanceDescription: m.maintenance_description,
        technicianName: m.technician_name,
        maintenanceDate: m.maintenance_date,
        createdAt: m.created_at
      })).sort((a: any, b: any) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime())
    }));
  },

  async createVehicleMaintenance(maintenance: { vehicle_id: string, problem_description: string, maintenance_description: string, technician_name: string, maintenance_date: string }) {
    const { data, error } = await supabase
      .from('vehicle_maintenances')
      .insert([maintenance])
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteVehicleMaintenance(id: string) {
    const { error } = await supabase.from('vehicle_maintenances').delete().eq('id', id);
    if (error) throw error;
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
  },

  async getVehicleDocTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('vehicle_doc_types').select('name').order('name');
      if (error || !data) throw error;
      return data.map((t: any) => t.name);
    } catch {
      return ['CRLV', 'ANTT', 'CIV', 'CIPP', 'Cronotacógrafo', 'Seguro Ambiental', 'Outro'];
    }
  },

  async addVehicleDocType(name: string) {
    const { error } = await supabase.from('vehicle_doc_types').insert([{ name }]);
    if (error) throw error;
  },

  async deleteVehicleDocType(name: string) {
    const { error } = await supabase.from('vehicle_doc_types').delete().eq('name', name);
    if (error) throw error;
  }
};
