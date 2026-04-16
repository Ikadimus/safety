
import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit2, Trash2, XCircle, FilePlus, ShieldCheck, MapPin, Phone, Briefcase, Calendar } from 'lucide-react';
import { Employee, DocStatus } from '../types';
import { dbService } from '../services/dbService';
import AddInternalEmployeeModal from './AddInternalEmployeeModal';
import AddDocumentModal from './AddDocumentModal';

const EmployeesManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [activeAddDoc, setActiveAddDoc] = useState<{id: string, name: string} | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await dbService.getInternalEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      e.name.toLowerCase().includes(term) ||
      e.cpf.includes(term) ||
      e.role.toLowerCase().includes(term) ||
      e.department?.toLowerCase().includes(term)
    );
  });

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Deseja remover o colaborador ${name}? Todos os seus documentos serão perdidos.`)) return;
    try {
      await dbService.deleteEmployee(id);
      fetchEmployees();
    } catch (err) {
      alert("Erro ao excluir colaborador.");
    }
  };

  const getStatusColor = (status: DocStatus) => {
    switch(status) {
      case DocStatus.VALID: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case DocStatus.EXPIRING: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case DocStatus.EXPIRED: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-4 rounded-3xl border border-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Colaboradores da Unidade</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestão de Segurança e Cursos Internos</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar por nome, CPF, setor..."
              className="w-full pl-12 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all text-sm text-slate-200 placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => { setIsAddModalOpen(true); setEmployeeToEdit(null); }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Novo Cadastro
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] py-32 text-center">
          <User className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Nenhum colaborador encontrado</h3>
          <p className="text-slate-600 mt-2">Tente ajustar sua busca ou cadastre um novo colaborador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden hover:border-blue-500/40 transition-all group">
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center border-4 border-slate-900 shadow-xl">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{employee.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-slate-700">CPF: {employee.cpf}</span>
                        <span className="text-[10px] bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-blue-500/20">{employee.department || 'Setor ND'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEmployeeToEdit(employee); setIsAddModalOpen(true); }}
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-950/40 rounded-3xl border border-slate-800/50 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <div className="text-xs">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Função / Cargo</p>
                        <p className="font-bold text-slate-200">{employee.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <div className="text-xs">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contratação</p>
                        <p className="font-bold text-slate-200">{employee.hiringDate ? new Date(employee.hiringDate).toLocaleDateString('pt-BR') : 'Data ND'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <div className="text-xs">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contatos</p>
                          <p className="font-bold text-slate-200">{employee.phone || 'N/D'} / {employee.emergencyPhone || 'Emergência N/D'}</p>
                        </div>
                      </div>
                      {employee.phone && (
                        <a 
                          href={`https://wa.me/55${employee.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="p-2 bg-emerald-600/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-900/10"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <div className="text-xs">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Endereço</p>
                        <p className="font-bold text-slate-200 truncate max-w-[180px]">
                          {employee.street ? `${employee.street}, ${employee.number} - ${employee.neighborhood}, ${employee.city}/${employee.state}` : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Treinamentos e NRs
                    </h4>
                    <button 
                      onClick={() => setActiveAddDoc({id: employee.id, name: employee.name})}
                      className="flex items-center gap-1.5 p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <FilePlus className="w-3 h-3" /> Adicionar Curso
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employee.documents && employee.documents.length > 0 ? (
                      employee.documents.map(doc => (
                        <div key={doc.id} className="flex flex-col p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 group/doc relative overflow-hidden">
                          <div className={`absolute top-0 right-0 w-1 h-full ${getStatusColor(doc.status).split(' ')[0]}`} />
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-white truncate max-w-[120px]">{doc.type}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase border ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold">Vence em: {new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</span>
                            <button 
                              onClick={async () => {
                                if(confirm('Excluir este certificado?')) {
                                  await dbService.deleteDocument(doc.id);
                                  fetchEmployees();
                                }
                              }}
                              className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover/doc:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800 text-center">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Nenhum treinamento registrado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddInternalEmployeeModal 
          isOpen={isAddModalOpen}
          employeeToEdit={employeeToEdit}
          onClose={() => { setIsAddModalOpen(false); setEmployeeToEdit(null); }}
          onSuccess={() => { setIsAddModalOpen(false); setEmployeeToEdit(null); fetchEmployees(); }}
        />
      )}

      {activeAddDoc && (
        <AddDocumentModal 
          isOpen={!!activeAddDoc}
          employeeId={activeAddDoc.id}
          employeeName={activeAddDoc.name}
          onClose={() => setActiveAddDoc(null)}
          onSuccess={() => { setActiveAddDoc(null); fetchEmployees(); }}
        />
      )}
    </div>
  );
};

export default EmployeesManagement;
