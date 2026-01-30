
import React, { useState } from 'react';
import { X, Factory, Send, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    contact_email: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbService.createProvider(formData);
      onSuccess();
    } catch (err) {
      alert("Erro ao cadastrar: Verifique se o CNPJ já existe ou as permissões do banco.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600/20 p-3 rounded-2xl border border-emerald-500/20">
              <Factory className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Novo Prestador</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cadastro de Empresa Terceirizada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Razão Social / Nome Fantasia</label>
            <input 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="Ex: Purifica Gás Ltda"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">CNPJ</label>
            <input 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">E-mail de Contato (Financeiro/RH)</label>
            <input 
              required
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="rh@empresa.com.br"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-2 flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Salvar Cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProviderModal;
