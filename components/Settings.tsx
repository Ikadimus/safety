
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, BookOpen, Loader2, Save, Clock, BellRing, ShieldAlert } from 'lucide-react';
import { dbService } from '../services/dbService';

const Settings: React.FC = () => {
  const [trainingTypes, setTrainingTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
      const types = await dbService.getTrainingTypes();
      setTrainingTypes(types);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    setSaving(true);
    try {
      await dbService.addTrainingType(newType.trim());
      setNewType('');
      await fetchSettings();
    } catch (err) {
      alert("Erro ao adicionar treinamento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Deseja remover "${name}" da lista de opções oficiais?`)) return;
    try {
      await dbService.deleteTrainingType(name);
      await fetchSettings();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const handleSavePeriod = () => {
    setSavingPeriod(true);
    localStorage.setItem('biosafety_alert_period', alertPeriod.toString());
    setTimeout(() => {
      setSavingPeriod(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Parâmetros de Sistema</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Configure as NRs e as regras de compliance da Usina</p>
        </div>
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <SettingsIcon className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Alerta de Vencimento */}
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500/10 p-2 rounded-lg">
                <BellRing className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Compliance</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Período de Alerta (Dias)</label>
                  <span className="text-2xl font-black text-emerald-500">{alertPeriod}d</span>
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
                  <span>Mínimo (5d)</span>
                  <span>Máximo (180d)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-medium bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 italic">
                Documentos serão marcados como "A Vencer" quando faltarem {alertPeriod} dias ou menos para o término da validade.
              </p>

              <button 
                onClick={handleSavePeriod}
                disabled={savingPeriod}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
              >
                {savingPeriod ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Save className="w-4 h-4 text-white" /> Atualizar Regra</>}
              </button>
            </div>
          </div>

          {/* Adição de NR */}
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Novo Padrão</h3>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Treinamento</label>
                <input 
                  required
                  placeholder="Ex: NR-10 Complementar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Save className="w-4 h-4 text-white" /> Registrar Opção</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden h-fit">
            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Cursos e Normas Cadastradas</h3>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-[9px] font-black text-emerald-500 uppercase">{trainingTypes.length} Ativos</span>
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="col-span-full py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : trainingTypes.length > 0 ? trainingTypes.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-sm font-bold text-slate-200 truncate">{type}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(type)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-white hover:text-red-500" />
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-500 italic text-sm">
                  Nenhum treinamento customizado encontrado.
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl h-fit">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Segurança de Dados</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                As alterações nos parâmetros de compliance afetam imediatamente o cálculo do status de todos os colaboradores na plataforma BioSafety. Utilize com cautela para garantir a conformidade legal da Usina Biometano Caieiras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
