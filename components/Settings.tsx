
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, BookOpen, Loader2, Save, Clock, BellRing, ShieldAlert, Truck, Building2, UserCircle2, Users2, LayoutDashboard } from 'lucide-react';
import { dbService } from '../services/dbService';

type SettingsTab = 'compliance' | 'provider_docs' | 'provider_employee_docs' | 'internal_employee_docs' | 'fleet_docs';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('compliance');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    trainingTypes: string[];
    vehicleDocTypes: string[];
    providerDocTypes: string[];
    internalDocTypes: string[];
  }>({
    trainingTypes: [],
    vehicleDocTypes: [],
    providerDocTypes: [],
    internalDocTypes: []
  });

  const [newType, setNewType] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [alertPeriod, setAlertPeriod] = useState(() => {
    const saved = localStorage.getItem('biosafety_alert_period');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [savingPeriod, setSavingPeriod] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [train, fleet, prov, intern] = await Promise.all([
        dbService.getTrainingTypes(),
        dbService.getVehicleDocTypes(),
        dbService.getProviderDocTypes(),
        dbService.getInternalDocTypes()
      ]);
      setData({
        trainingTypes: train,
        vehicleDocTypes: fleet,
        providerDocTypes: prov,
        internalDocTypes: intern
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    setSaving(true);
    try {
      switch (activeTab) {
        case 'provider_employee_docs':
          await dbService.addTrainingType(newType.trim());
          break;
        case 'fleet_docs':
          await dbService.addVehicleDocType(newType.trim());
          break;
        case 'provider_docs':
          await dbService.addProviderDocType(newType.trim());
          break;
        case 'internal_employee_docs':
          await dbService.addInternalDocType(newType.trim());
          break;
      }
      setNewType('');
      await fetchSettings();
    } catch (err) {
      alert("Erro ao adicionar parâmetro.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Deseja remover "${name}" da lista oficial?`)) return;
    try {
      switch (activeTab) {
        case 'provider_employee_docs':
          await dbService.deleteTrainingType(name);
          break;
        case 'fleet_docs':
          await dbService.deleteVehicleDocType(name);
          break;
        case 'provider_docs':
          await dbService.deleteProviderDocType(name);
          break;
        case 'internal_employee_docs':
          await dbService.deleteInternalDocType(name);
          break;
      }
      await fetchSettings();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const handleSavePeriod = () => {
    setSavingPeriod(true);
    localStorage.setItem('biosafety_alert_period', alertPeriod.toString());
    setTimeout(() => setSavingPeriod(false), 800);
  };

  const tabs: { id: SettingsTab; label: string; icon: any; description: string }[] = [
    { id: 'compliance', label: 'Alertas', icon: BellRing, description: 'Regras de vigência' },
    { id: 'provider_docs', label: 'Prestadoras', icon: Building2, description: 'Docs da Empresa' },
    { id: 'provider_employee_docs', label: 'Efetivo Externo', icon: Users2, description: 'NRs de Terceiros' },
    { id: 'internal_employee_docs', label: 'Colaboradores', icon: UserCircle2, description: 'Docs Internos' },
    { id: 'fleet_docs', label: 'Frota', icon: Truck, description: 'Docs de Veículos' },
  ];

  const getListToRender = () => {
    switch(activeTab) {
      case 'provider_employee_docs': return data.trainingTypes;
      case 'fleet_docs': return data.vehicleDocTypes;
      case 'provider_docs': return data.providerDocTypes;
      case 'internal_employee_docs': return data.internalDocTypes;
      default: return [];
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Configurações Base</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Gestão de NRs, Conformidade e Regras de Segurança</p>
        </div>
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <SettingsIcon className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                activeTab === tab.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">{tab.label}</p>
                <p className={`text-[9px] font-medium ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-600'}`}>{tab.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'compliance' ? (
            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative max-w-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Clock className="w-24 h-24 text-white" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                  <BellRing className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg uppercase tracking-tight">Janela de Alerta</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Compliance de validade</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período Crítico (Dias)</label>
                    <span className="text-3xl font-black text-emerald-500">{alertPeriod}d</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    value={alertPeriod}
                    onChange={(e) => setAlertPeriod(parseInt(e.target.value, 10))}
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                    <span>Mínimo Operacional (5d)</span>
                    <span>Prazo Estratégico (180d)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Configuração Global: Todo documento com vencimento inferior a <strong>{alertPeriod} dias</strong> será sinalizado como alerta crítico de renovação nos painéis de controle.
                  </p>
                </div>

                <button 
                  onClick={handleSavePeriod}
                  disabled={savingPeriod}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40"
                >
                  {savingPeriod ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Confirmar Parâmetro
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Form de Adição */}
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20">
                    <Plus className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg uppercase tracking-tight">Nova Exigência</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tabs.find(t => t.id === activeTab)?.label}</p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="flex gap-4">
                  <input 
                    required
                    placeholder={`Ex: ${activeTab === 'fleet_docs' ? 'Laudo de Tanque' : 'NR-10'}`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-800"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
                  </button>
                </form>
              </div>

              {/* Listagem */}
              <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Padrões Ativos</h3>
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase">
                    {getListToRender().length} Requisitos
                  </span>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loading ? (
                    <div className="col-span-full py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : getListToRender().length > 0 ? getListToRender().map((type, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
                        <span className="text-sm font-bold text-slate-200 truncate">{type}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(type)}
                        className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-slate-500 italic text-sm">
                      Nenhum requisito cadastrado para este setor.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
