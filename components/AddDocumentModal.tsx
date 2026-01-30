
import React, { useState, useEffect } from 'react';
import { X, FilePlus, Calendar, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface AddDocumentModalProps {
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ employeeId, employeeName, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [trainingTypes, setTrainingTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    if (isOpen) {
      const loadTypes = async () => {
        const types = await dbService.getTrainingTypes();
        setTrainingTypes(types);
        if (types.length > 0) setFormData(prev => ({ ...prev, type: types[0] }));
        setFetchingTypes(false);
      };
      loadTypes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) return alert("Selecione um tipo de treinamento.");
    setLoading(true);
    try {
      await dbService.createDocument({
        ...formData,
        employee_id: employeeId
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao salvar documento.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600/20 p-3 rounded-2xl border border-emerald-500/20">
              <FilePlus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Lançar Certificado</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{employeeName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tipo de Documento / NR</label>
            <div className="relative">
              <select 
                disabled={fetchingTypes}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none appearance-none disabled:opacity-50"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {fetchingTypes ? (
                  <option>Carregando opções...</option>
                ) : trainingTypes.map(nr => <option key={nr} value={nr}>{nr}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Data de Emissão</label>
            <input 
              type="date"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              value={formData.issue_date}
              onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Data de Vencimento</label>
            <input 
              type="date"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              value={formData.expiry_date}
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || fetchingTypes}
            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Certificado"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;
