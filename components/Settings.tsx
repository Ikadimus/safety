
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Plus, Trash2, BookOpen, Loader2, Save, 
  Clock, BellRing, ShieldAlert, ChevronRight, ChevronDown, Edit3, 
  Check, X, CornerDownRight 
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { TrainingType } from '../types';

const Settings: React.FC = () => {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  
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

  const handleAddChild = async (parentId: string) => {
    if (!childName.trim()) return;
    setSaving(true);
    try {
      await dbService.addTrainingType(childName.trim(), parentId);
      setChildName('');
      setAddingChildTo(null);
      setExpandedIds(prev => new Set(prev).add(parentId));
      await fetchSettings();
    } catch (err) {
      alert("Erro ao adicionar sub-nível.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      await dbService.updateTrainingType(id, editValue.trim());
      setEditingId(null);
      await fetchSettings();
    } catch (err) {
      alert("Erro ao atualizar.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja remover "${name}"? Isso pode afetar registros vinculados.`)) return;
    try {
      await dbService.deleteTrainingType(id);
      await fetchSettings();
    } catch (err) {
      alert("Erro ao excluir. Verifique se existem dependências.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSavePeriod = () => {
    setSavingPeriod(true);
    localStorage.setItem('biosafety_alert_period', alertPeriod.toString());
    setTimeout(() => {
      setSavingPeriod(false);
    }, 800);
  };

  const renderTrainingItem = (item: TrainingType, depth = 0) => {
    const children = trainingTypes.filter(t => t.parent_id === item.id);
    const isExpanded = expandedIds.has(item.id);
    const isEditing = editingId === item.id;
    const isAddingChild = addingChildTo === item.id;

    return (
      <div key={item.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
            depth > 0 ? 'bg-slate-900/30 ml-6 border-slate-800/40' : 'bg-slate-950/50 border-slate-800'
          } hover:border-emerald-500/30`}
        >
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            {depth > 0 && <CornerDownRight className="w-3 h-3 text-slate-700 shrink-0" />}
            {children.length > 0 ? (
              <button onClick={() => toggleExpand(item.id)} className="text-slate-500 hover:text-emerald-500 transition-colors">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-4" />
            )}
            
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input 
                  autoFocus
                  className="bg-slate-900 border border-emerald-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none w-full"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item.id)}
                />
                <button onClick={() => handleUpdate(item.id)} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${depth > 0 ? 'text-slate-600' : 'text-emerald-500/60'}`} />
                <span className={`text-sm font-bold truncate ${depth === 0 ? 'text-slate-200' : 'text-slate-400'}`}>
                  {item.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            {!isEditing && (
              <>
                <button 
                  onClick={() => { setAddingChildTo(item.id); setChildName(''); }}
                  className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all"
                  title="Adicionar Sub-nível"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => { setEditingId(item.id); setEditValue(item.name); }}
                  className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all"
                  title="Renomear"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {isAddingChild && (
          <div className="ml-12 p-2 bg-slate-900/50 rounded-xl border border-dashed border-emerald-500/30 flex items-center gap-2 animate-in slide-in-from-top-2">
            <input 
              autoFocus
              placeholder="Nome do sub-nível..."
              className="bg-transparent text-xs text-white focus:outline-none flex-1 px-2"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChild(item.id)}
            />
            <button onClick={() => handleAddChild(item.id)} className="text-emerald-500 p-1"><Check className="w-4 h-4" /></button>
            <button onClick={() => setAddingChildTo(null)} className="text-slate-500 p-1"><X className="w-4 h-4" /></button>
          </div>
        )}

        {isExpanded && children.length > 0 && (
          <div className="space-y-1">
            {children.map(child => renderTrainingItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelTypes = trainingTypes.filter(t => !t.parent_id);

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
              </div>
              <button 
                onClick={handleSavePeriod}
                disabled={savingPeriod}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
              >
                {savingPeriod ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Save className="w-4 h-4 text-white" /> Atualizar Regra</>}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Nova Norma Raiz</h3>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da NR Principal</label>
                <input 
                  required
                  placeholder="Ex: NR-10"
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Save className="w-4 h-4 text-white" /> Registrar NR Raiz</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Cursos e Normas Cadastradas</h3>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-[9px] font-black text-emerald-500 uppercase">{trainingTypes.length} Registros</span>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-2">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-emerald-500/40">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Lendo estrutura...</p>
                </div>
              ) : topLevelTypes.length > 0 ? (
                topLevelTypes.map(type => renderTrainingItem(type))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-700">
                  <BookOpen className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm italic">Nenhuma norma cadastrada no protocolo.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl h-fit">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Instrução de Hierarquia</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilize o botão <Plus className="w-3 h-3 inline text-emerald-500" /> para criar sub-níveis (Ex: NR-10 &gt; Básico). Edite nomes diretamente clicando no ícone de lápis. A exclusão de um item pai removerá também seus níveis descendentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
