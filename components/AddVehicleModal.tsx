
import React, { useState, useEffect } from 'react';
import { X, Truck, Save, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Vehicle, Provider } from '../types';

interface AddVehicleModalProps {
  isOpen: boolean;
  vehicleToEdit?: Vehicle | null;
  providers: Provider[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, vehicleToEdit, providers, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    type: 'Carreta',
    provider_id: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        plate: vehicleToEdit.plate,
        model: vehicleToEdit.model,
        type: vehicleToEdit.type,
        provider_id: vehicleToEdit.providerId,
        status: vehicleToEdit.status
      });
    } else {
      setFormData({
        plate: '',
        model: '',
        type: 'Carreta',
        provider_id: providers.length > 0 ? providers[0].id : '',
        status: 'ACTIVE'
      });
    }
  }, [vehicleToEdit, isOpen, providers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (vehicleToEdit) {
        await dbService.updateVehicle(vehicleToEdit.id, formData);
      } else {
        await dbService.createVehicle(formData);
      }
      onSuccess();
    } catch (err: any) {
      alert(`Erro: ${err.message || "Verifique os dados ou as permissões do banco."}`);
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
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{vehicleToEdit ? 'Editar Veículo' : 'Novo Veículo'}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Protocolo de Cadastro de Frota</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-white">Placa</label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-700 uppercase"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-white">Tipo</label>
              <select 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Cavalo">Cavalo</option>
                <option value="Carreta">Carreta</option>
                <option value="Bitrem">Bitrem</option>
                <option value="Rodotrem">Rodotrem</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-white">Modelo / Descrição</label>
            <input 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="Ex: Scania R450 2022"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-white">Transportadora Responsável</label>
            <select 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
              value={formData.provider_id}
              onChange={(e) => setFormData({...formData, provider_id: e.target.value})}
            >
              <option value="" disabled>Selecione uma empresa</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {vehicleToEdit ? 'Salvar Alteração' : 'Cadastrar Veículo'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
