
import React, { useState } from 'react';
import { X, Wrench, Save, Loader2, User, AlertCircle } from 'lucide-react';
import { dbService } from '../services/dbService';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  vehicleId: string;
  vehiclePlate: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ isOpen, vehicleId, vehiclePlate, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    problem_description: '',
    maintenance_description: '',
    technician_name: '',
    maintenance_date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbService.createVehicleMaintenance({
        ...formData,
        vehicle_id: vehicleId
      });
      onSuccess();
    } catch (err: any) {
      alert(`Erro: ${err.message || "Falha ao salvar manutenção."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
              <Wrench className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Registrar Manutenção</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Veículo: {vehiclePlate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Problema Apresentado
            </label>
            <textarea 
              required
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="Descreva o defeito ou motivo da parada..."
              value={formData.problem_description}
              onChange={(e) => setFormData({...formData, problem_description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Wrench className="w-3 h-3" /> Serviço Realizado
            </label>
            <textarea 
              required
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="O que foi consertado ou trocado?"
              value={formData.maintenance_description}
              onChange={(e) => setFormData({...formData, maintenance_description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Técnico
              </label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-700"
                placeholder="Nome do mecânico"
                value={formData.technician_name}
                onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Data</label>
              <input 
                type="date"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                value={formData.maintenance_date}
                onChange={(e) => setFormData({...formData, maintenance_date: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenanceModal;
