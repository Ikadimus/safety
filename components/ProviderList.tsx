
import React, { useState } from 'react';
import { Plus, Search, ChevronRight, UserPlus, Bot, ShieldAlert } from 'lucide-react';
import { Provider, Employee } from '../types';
import { analyzeCompliance } from '../services/geminiService';
import AddEmployeeModal from './AddEmployeeModal';

interface ProviderListProps {
  providers: Provider[];
  onAddProvider: () => void;
  onViewEmployee: (emp: Employee) => void;
  onRefresh: () => void;
}

const ProviderList: React.FC<ProviderListProps> = ({ providers, onAddProvider, onViewEmployee, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [activeAddEmployee, setActiveAddEmployee] = useState<{id: string, name: string} | null>(null);

  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cnpj?.includes(searchTerm)
  );

  const handleAiAnalysis = async (provider: Provider) => {
    setAnalyzingIds(prev => new Set(prev).add(provider.id));
    const dataStr = provider.employees?.map(e => `${e.name} (${e.role}): ${e.documents?.map(d => `${d.type}-${d.status}`).join(', ')}`).join('; ') || 'Nenhum funcionário';
    const result = await analyzeCompliance(provider.name, dataStr);
    if (result) {
      setAiAnalysis(prev => ({ ...prev, [provider.id]: result }));
    }
    setAnalyzingIds(prev => {
      const next = new Set(prev);
      next.delete(provider.id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar fornecedor ou CNPJ..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all text-sm text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={onAddProvider}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Prestadora
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProviders.length > 0 ? filteredProviders.map(provider => (
          <div key={provider.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden group hover:border-slate-700 transition-all">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-black text-emerald-500 border border-slate-700">
                  {provider.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{provider.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{provider.cnpj}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-xs text-slate-400 font-medium">{provider.contactEmail}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAiAnalysis(provider)}
                  disabled={analyzingIds.has(provider.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${analyzingIds.has(provider.id) ? 'bg-slate-800 text-slate-600 border-slate-700' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}
                >
                  <Bot className={`w-4 h-4 ${analyzingIds.has(provider.id) ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Auditoria IA</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quadro de Colaboradores</h4>
                <button 
                  onClick={() => setActiveAddEmployee({ id: provider.id, name: provider.name })}
                  className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:text-emerald-400"
                >
                  <UserPlus className="w-3 h-3" /> Adicionar Colaborador
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {provider.employees?.map(employee => (
                  <div 
                    key={employee.id} 
                    onClick={() => onViewEmployee(employee)}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{employee.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{employee.role}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {employee.documents?.map(doc => (
                        <span 
                          key={doc.id} 
                          className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-tighter ${
                            doc.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            doc.status === 'EXPIRING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}
                        >
                          {doc.type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!provider.employees || provider.employees.length === 0) && (
                  <p className="text-xs text-slate-600 italic py-4">Nenhum funcionário cadastrado ainda.</p>
                )}
              </div>
            </div>

            {aiAnalysis[provider.id] && (
              <div className="m-6 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative animate-in fade-in zoom-in-95 duration-300">
                <button onClick={() => setAiAnalysis(prev => {const n={...prev}; delete n[provider.id]; return n;})} className="absolute top-4 right-4 text-slate-600 hover:text-slate-200 transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
                <div className="flex gap-4">
                  <div className="bg-emerald-500/20 p-2 rounded-lg h-fit">
                    <ShieldAlert className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-emerald-400 mb-2 uppercase tracking-widest">Parecer Gemini AI - Caieiras</h5>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{aiAnalysis[provider.id]}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 font-medium">Nenhum fornecedor cadastrado na base de dados.</p>
            <button onClick={onAddProvider} className="text-emerald-500 font-bold mt-2 hover:underline">Cadastrar o primeiro agora</button>
          </div>
        )}
      </div>

      <AddEmployeeModal 
        isOpen={!!activeAddEmployee}
        providerId={activeAddEmployee?.id || ''}
        providerName={activeAddEmployee?.name || ''}
        onClose={() => setActiveAddEmployee(null)}
        onSuccess={() => {
          setActiveAddEmployee(null);
          onRefresh();
        }}
      />
    </div>
  );
};

export default ProviderList;
