
import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck, Edit2, Trash2, XCircle, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Vehicle, Provider, VehicleDocument } from '../types';
import { dbService } from '../services/dbService';
import AddVehicleModal from './AddVehicleModal';
import AddDocumentModal from './AddDocumentModal';

interface FleetViewProps {
  providers: Provider[];
  onRefresh: () => void;
}

const FleetView: React.FC<FleetViewProps> = ({ providers, onRefresh }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [activeAddDoc, setActiveAddDoc] = useState<{id: string, name: string} | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await dbService.getFleetData();
      setVehicles(data);
    } catch (err) {
      console.error("Erro ao buscar frota:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      v.plate?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.type?.toLowerCase().includes(term) ||
      v.providerName?.toLowerCase().includes(term)
    );
  });

  const handleDeleteVehicle = async (id: string, plate: string) => {
    if (!confirm(`Deseja remover permanentemente o veículo ${plate}?`)) return;
    try {
      await dbService.deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      alert("Erro ao excluir veículo.");
    }
  };

  const handleAddDocSuccess = () => {
    setActiveAddDoc(null);
    fetchVehicles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Pesquise por placa, modelo, tipo ou transportadora..."
            className="w-full pl-12 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={() => setIsAddVehicleOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95">
          <Plus className="w-4 h-4" /> Novo Veículo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden hover:border-emerald-500/40 transition-all group">
              <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Truck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{vehicle.plate}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{vehicle.type} • {vehicle.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setVehicleToEdit(vehicle); setIsAddVehicleOpen(true); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Transportadora</p>
                  <p className="text-sm font-bold text-slate-200">{vehicle.providerName || 'Não vinculada'}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Documentação</p>
                    <button 
                      onClick={() => setActiveAddDoc({ id: vehicle.id, name: vehicle.plate })}
                      className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {vehicle.documents && vehicle.documents.length > 0 ? (
                      vehicle.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 group/doc">
                          <div className="flex items-center gap-3">
                            {doc.status === 'EXPIRED' ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : doc.status === 'EXPIRING' ? (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-200">{doc.type}</p>
                              <p className="text-[9px] text-slate-500 font-medium">Vence em: {new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              if(confirm('Excluir este documento?')) {
                                await dbService.deleteVehicleDocument(doc.id);
                                fetchVehicles();
                              }
                            }}
                            className="opacity-0 group-hover/doc:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Nenhum documento</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddVehicleModal 
        isOpen={isAddVehicleOpen}
        vehicleToEdit={vehicleToEdit}
        providers={providers}
        onClose={() => { setIsAddVehicleOpen(false); setVehicleToEdit(null); }}
        onSuccess={() => { setIsAddVehicleOpen(false); setVehicleToEdit(null); fetchVehicles(); }}
      />

      {activeAddDoc && (
        <AddDocumentModal 
          isOpen={!!activeAddDoc}
          employeeId={activeAddDoc.id} // Reusing AddDocumentModal, but I need to check if it supports vehicles
          employeeName={activeAddDoc.name}
          onClose={() => setActiveAddDoc(null)}
          onSuccess={handleAddDocSuccess}
          isVehicle={true} // I'll modify AddDocumentModal to support this
        />
      )}
    </div>
  );
};

export default FleetView;
