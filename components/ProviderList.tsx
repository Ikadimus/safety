
import React, { useState } from 'react';
import { Plus, Search, UserPlus, ShieldCheck, Edit2, Trash2, XCircle } from 'lucide-react';
import { Provider, Employee } from '../types';
import { dbService } from '../services/dbService';
import AddEmployeeModal from './AddEmployeeModal';

interface ProviderListProps {
  providers: Provider[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddProvider: () => void;
  onEditProvider: (provider: Provider) => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (providerId: string, providerName: string, employee: Employee) => void;
  onRefresh: () => void;
}

const ProviderList: React.FC<ProviderListProps> = ({ 
  providers, 
  searchTerm, 
  onSearchChange, 
  onAddProvider, 
  onEditProvider, 
  onViewEmployee, 
  onEditEmployee, 
  onRefresh 
}) => {
  const [activeAddEmployee, setActiveAddEmployee] = useState<{id: string, name: string} | null>(null);

  const filteredProviders = providers.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const providerMatches = 
      p.name?.toLowerCase().includes(term) || 
      p.cnpj?.includes(term) || 
      p.contactEmail?.toLowerCase().includes(term);
    
    if (providerMatches) return true;

    const employeeMatches = p.employees?.some(e => {
      const basicInfoMatches = 
        e.name?.toLowerCase().includes(term) || 
        e.role?.toLowerCase().includes(term) || 
        e.cpf?.includes(term);

      if (basicInfoMatches) return true;
      return e.documents?.some(d => d.type?.toLowerCase().includes(term));
    });

    return employeeMatches;
  });

  const handleDeleteProvider = async (id: string, name: string) => {
    if (!confirm(`Deseja remover permanentemente o prestador ${name}?`)) return;
    try {
      await dbService.deleteProvider(id);
      onRefresh();
    } catch (err) {
      alert("Erro ao excluir prestador.");
    }
  };

  const handleDeleteEmployee = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Deseja remover o colaborador ${name}?`)) return;
    try {
      await dbService.deleteEmployee(id);
      onRefresh();
    } catch (err) {
      alert("Erro ao excluir colaborador.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Pesquise por empresa, colaborador, CPF ou NR..."
            className="w-full pl-12 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => onSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={onAddProvider} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95">
          <Plus className="w-4 h-4" /> Nova Prestadora
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredProviders.map(provider => (
          <div key={provider.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header Prestador */}
            <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <span className="font-black text-emerald-500">{provider.name?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{provider.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{provider.cnpj} • {provider.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEditProvider(provider)} className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteProvider(provider.id, provider.name)} className="p-2 text-white hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quadro de Colaboradores */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efetivo de Campo</h4>
                </div>
                <button onClick={() => setActiveAddEmployee({ id: provider.id, name: provider.name })} className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline">
                  <UserPlus className="w-3 h-3" /> Incluir Colaborador
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {provider.employees?.map(employee => {
                   const isMatch = searchTerm && (
                      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      employee.cpf?.includes(searchTerm) ||
                      employee.documents?.some(d => d.type?.toLowerCase().includes(searchTerm.toLowerCase()))
                   );

                   return (
                    <div 
                      key={employee.id} 
                      onClick={() => onViewEmployee(employee)} 
                      className={`p-5 rounded-2xl border transition-all cursor-pointer group relative ${isMatch ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-slate-950/50 border-slate-800 hover:border-emerald-500/40'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="overflow-hidden">
                          <p className="font-black text-white group-hover:text-emerald-400 transition-colors truncate">{employee.name}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{employee.role}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); onEditEmployee(provider.id, provider.name, employee); }} className="p-1.5 bg-slate-800 hover:bg-blue-600 rounded-lg text-white transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => handleDeleteEmployee(e, employee.id, employee.name)} className="p-1.5 bg-slate-800 hover:bg-red-600 rounded-lg text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {employee.documents?.map(doc => (
                          <span key={doc.id} className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase border ${doc.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {doc.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddEmployeeModal 
        isOpen={!!activeAddEmployee}
        providerId={activeAddEmployee?.id || ''}
        providerName={activeAddEmployee?.name || ''}
        onClose={() => setActiveAddEmployee(null)}
        onSuccess={() => { setActiveAddEmployee(null); onRefresh(); }}
      />
    </div>
  );
};

export default ProviderList;
