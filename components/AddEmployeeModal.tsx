
import React, { useState } from 'react';
import { X, UserPlus, Send, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface AddEmployeeModalProps {
  providerId: string;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ providerId, providerName, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    role: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbService.createEmployee({
        ...formData,
        provider_id: providerId
      });
      onSuccess();
      setFormData({ name: '', cpf: '', role: '' });
    } catch (err) {
      alert("Erro ao cadastrar funcionário. Verifique o CPF ou conexão.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
              <UserPlus className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Novo Colaborador</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vincular a: {providerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
            <input 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="Nome do trabalhador"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">CPF</label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Função</label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
                placeholder="Ex: Soldador"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-2 flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Cadastrar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
