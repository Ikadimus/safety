
import React from 'react';
import { X, History, Wrench, User, Calendar, AlertCircle, Trash2, Truck } from 'lucide-react';
import { Vehicle, VehicleMaintenance } from '../types';
import { dbService } from '../services/dbService';

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onRefresh: () => void;
}

const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({ isOpen, vehicle, onClose, onRefresh }) => {
  if (!isOpen || !vehicle) return null;

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro de manutenção?')) return;
    try {
      await dbService.deleteVehicleMaintenance(id);
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir manutenção.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-blue-600/20 p-4 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
              <History className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-white tracking-tight">Histórico de Manutenção</h2>
                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700">
                  {vehicle.maintenances?.length || 0} Registros
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-700/50">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{vehicle.plate}</span>
                </div>
                <span className="text-xs font-medium">•</span>
                <span className="text-xs font-medium uppercase tracking-wider">{vehicle.model}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-700 group relative z-10"
          >
            <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-900/50">
          {vehicle.maintenances && vehicle.maintenances.length > 0 ? (
            <div className="space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/50 via-slate-800 to-transparent" />

              {vehicle.maintenances.map((m, idx) => (
                <div key={m.id} className="relative pl-16 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-14 h-14 flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-900 rounded-full border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10" />
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-900/10 group/card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Data da Manutenção</p>
                          <p className="text-xl font-black text-white">{new Date(m.maintenanceDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="self-start md:self-center flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/card:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                          Problema Relatado
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50 min-h-[80px]">
                          <p className="text-sm text-slate-200 leading-relaxed font-medium">{m.problemDescription}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                          Serviço Executado
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50 min-h-[80px]">
                          <p className="text-sm text-slate-200 leading-relaxed font-medium">{m.maintenanceDescription}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Técnico Responsável</p>
                          <p className="text-xs font-bold text-slate-300">{m.technicianName}</p>
                        </div>
                      </div>
                      <div className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
                        Ref: {m.id.split('-')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-700/50 mb-6">
                <History className="w-16 h-16 text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Sem histórico disponível</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Não encontramos registros de manutenção para este veículo até o momento.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 bg-slate-950/30 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-slate-700 active:scale-95 shadow-xl"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
