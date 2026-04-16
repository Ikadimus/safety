
export enum DocStatus {
  VALID = 'VALID',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING'
}

export enum ProviderStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING'
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  created_at?: string;
}

export interface Document {
  id: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: DocStatus;
  fileUrl?: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  role: string;
  providerId?: string;
  providerName?: string;
  documents: Document[];
  phone?: string;
  emergencyPhone?: string;
  department?: string;
  hiringDate?: string;
  isInternal: boolean;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface VehicleDocument extends Document {
  vehicleId: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  problemDescription: string;
  maintenanceDescription: string;
  technicianName: string;
  maintenanceDate: string;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: string; // e.g., Cavalo, Carreta, Bitrem
  providerId: string;
  providerName?: string;
  documents: VehicleDocument[];
  maintenances?: VehicleMaintenance[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Provider {
  id: string;
  name: string;
  cnpj: string;
  status: ProviderStatus;
  employees: Employee[];
  contactEmail: string;
  score?: number; // Calculado dinamicamente
  isBlocked?: boolean; // Baseado no Score e criticidade
  documents: Document[];
}
