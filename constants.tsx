
import React from 'react';
import { Shield, Users, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const NR_LIST = [
  'NR-01 (Integração)',
  'NR-06 (EPI)',
  'NR-10 (Elétrica)',
  'NR-11 (Transporte/Carga)',
  'NR-12 (Máquinas)',
  'NR-13 (Vasos de Pressão)',
  'NR-20 (Inflamáveis)',
  'NR-33 (Espaço Confinado)',
  'NR-35 (Trabalho em Altura)',
  'ASO (Saúde Ocupacional)',
  'Integração Biometano',
];

export const STATUS_COLORS = {
  VALID: 'bg-green-100 text-green-700 border-green-200',
  EXPIRING: 'bg-amber-100 text-amber-700 border-amber-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const MOCK_PROVIDERS = [
  {
    id: '1',
    name: 'Gás-Tech Manutenção Ltda',
    cnpj: '12.345.678/0001-90',
    status: 'ACTIVE',
    contactEmail: 'contato@gastech.com',
    employees: [
      {
        id: 'e1',
        name: 'Roberto Silva',
        cpf: '123.456.789-00',
        role: 'Soldador Especialista',
        providerId: '1',
        documents: [
          { id: 'd1', type: 'NR-33', issueDate: '2023-01-01', expiryDate: '2024-01-01', status: 'EXPIRED' },
          { id: 'd2', type: 'NR-35', issueDate: '2024-02-15', expiryDate: '2025-02-15', status: 'VALID' },
          { id: 'd3', type: 'ASO', issueDate: '2023-11-20', expiryDate: '2024-05-20', status: 'EXPIRING' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Logística Verde Transportes',
    cnpj: '98.765.432/0001-21',
    status: 'PENDING',
    contactEmail: 'rh@logverde.com.br',
    employees: [
      {
        id: 'e2',
        name: 'Ana Paula Oliveira',
        cpf: '987.654.321-11',
        role: 'Operadora de Máquinas',
        providerId: '2',
        documents: [
          { id: 'd4', type: 'NR-11', issueDate: '2024-01-10', expiryDate: '2025-01-10', status: 'VALID' }
        ]
      }
    ]
  }
];
