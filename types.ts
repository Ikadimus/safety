
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

export interface TrainingType {
  id: string;
  name: string;
  parent_id?: string | null;
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
  providerId: string;
  documents: Document[];
}

export interface Provider {
  id: string;
  name: string;
  cnpj: string;
  status: ProviderStatus;
  employees: Employee[];
  contactEmail: string;
}
