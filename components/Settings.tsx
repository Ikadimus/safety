
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, BookOpen, Loader2, Save } from 'lucide-react';
import { dbService } from '../services/dbService';

const Settings: React.FC = () => {
  const [trainingTypes, setTrainingTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [saving, setSaving] = useState(false);

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
      alert("Erro ao adicionar treinamento. Verifique se a tabela 'training_types' existe.");
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Parâmetros de Sistema</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Configure as NRs e Cursos obrigatórios da Usina</p>
        </div>
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <SettingsIcon className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adição */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Novo Padrão</h3>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da NR ou Treinamento</label>
                <input 
                  required
                  placeholder="Ex: NR-10 Complementar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Registrar Opção</>}
              </button>
            </form>
          </div>
        </div>

        {/* Listagem de Opções */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-950/50 border-b border-slate-800">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Cursos e Normas Cadastradas</h3>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading ? (
                <div className="col-span-full py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : trainingTypes.length > 0 ? trainingTypes.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-200">{type}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(type)}
                    className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-500 italic text-sm">
                  Nenhum treinamento customizado encontrado.
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Nota Técnica</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              As opções cadastradas aqui ficarão disponíveis imediatamente para todos os técnicos ao lançar novos certificados para colaboradores terceirizados na plataforma BioSafety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
