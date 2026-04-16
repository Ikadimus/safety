
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Send, Loader2, Save, MapPin, Phone, PhoneCall, Briefcase, Calendar } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Employee } from '../types';

interface AddInternalEmployeeModalProps {
  isOpen: boolean;
  employeeToEdit?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddInternalEmployeeModal: React.FC<AddInternalEmployeeModalProps> = ({ isOpen, employeeToEdit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    role: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    phone: '',
    emergency_phone: '',
    department: '',
    hiring_date: '',
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name || '',
        cpf: employeeToEdit.cpf || '',
        role: employeeToEdit.role || '',
        street: employeeToEdit.street || '',
        number: employeeToEdit.number || '',
        neighborhood: employeeToEdit.neighborhood || '',
        city: employeeToEdit.city || '',
        state: employeeToEdit.state || '',
        phone: employeeToEdit.phone || '',
        emergency_phone: employeeToEdit.emergencyPhone || '',
        department: employeeToEdit.department || '',
        hiring_date: employeeToEdit.hiringDate || '',
      });
    } else {
      setFormData({ 
        name: '', cpf: '', role: '', street: '', number: '', neighborhood: '', city: '', state: '', phone: '', emergency_phone: '', department: '', hiring_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employeeToEdit) {
        await dbService.updateEmployee(employeeToEdit.id, formData);
      } else {
        await dbService.createEmployee({
          ...formData,
          is_internal: true
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(`Erro ao salvar colaborador: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
              <UserPlus className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{employeeToEdit ? 'Editar Dados do Colaborador' : 'Novo Colaborador Interno'}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cadastro de Segurança da Unidade</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Sessão: Dados Básicos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificação Profissional</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Nome completo do colaborador"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">CPF</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Função</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Ex: Operador de Unidade"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Setor / Departamento</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Ex: Manutenção / Operação"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Contratação</label>
                <input 
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all text-sm"
                  value={formData.hiring_date}
                  onChange={(e) => setFormData({...formData, hiring_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Sessão: Localização */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Residência e Localização</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Logradouro / Rua</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Nome da rua / Avenida"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Número</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Ex: 123"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                />
              </div>

              <div className="md:col-span-9 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Bairro</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Ex: Centro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                />
              </div>

              <div className="md:col-span-9 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="Nome da cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">UF</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm text-center"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                />
              </div>
            </div>
          </div>

          {/* Sessão: Contatos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
              <PhoneCall className="w-4 h-4 text-orange-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comunicação e Emergência</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone Principal (WhatsApp)</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Contato de Emergência</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-orange-600 focus:outline-none transition-all placeholder:text-slate-800 text-sm"
                  placeholder="(00) 00000-0000"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4 sticky bottom-0 bg-slate-900 pb-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-950 text-slate-400 border border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
              Descartar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-2 flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  {employeeToEdit ? <Save className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
                  {employeeToEdit ? 'Atualizar Protocolo' : 'Efetivar Cadastro'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInternalEmployeeModal;
