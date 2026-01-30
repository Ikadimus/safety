
import React, { useState } from 'react';
import { X, Shield, FileCheck, Download, Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Employee } from '../types';
import AddDocumentModal from './AddDocumentModal';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onRefresh: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onRefresh }) => {
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  if (!employee) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-slate-900 w-full max-w-4xl rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 flex items-center justify-between text-white">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-black/20 rounded-2xl flex items-center justify-center border border-white/10">
                <Shield className="w-12 h-12 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">{employee.name}</h2>
                <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mt-1">
                  {employee.role} • <span className="text-white">CPF: {employee.cpf}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white">Documentação Legal</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Conformidade com Normas Regulamentadoras</p>
              </div>
              <button 
                onClick={() => setIsAddingDoc(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40"
              >
                <Plus className="w-4 h-4" /> Lançar NR / Curso
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-4 font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">Treinamento / Certificação</th>
                    <th className="pb-4 font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">Conclusão</th>
                    <th className="pb-4 font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">Vencimento</th>
                    <th className="pb-4 font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">Situação</th>
                    <th className="pb-4 font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {employee.documents?.length > 0 ? employee.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${doc.status === 'EXPIRED' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                            <FileCheck className={`w-5 h-5 ${doc.status === 'EXPIRED' ? 'text-red-400' : 'text-emerald-400'}`} />
                          </div>
                          <span className="font-bold text-slate-200">{doc.type}</span>
                        </div>
                      </td>
                      <td className="py-5 text-slate-400 text-sm font-medium">{new Date(doc.issueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span className="text-slate-200 text-sm font-bold">{new Date(doc.expiryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          doc.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          doc.status === 'EXPIRING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {doc.status === 'EXPIRED' ? 'EXPIRADO' : doc.status === 'EXPIRING' ? 'VENCENDO' : 'VÁLIDO'}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-600 hover:text-blue-400 transition-all hover:bg-blue-500/10 rounded-lg" title="Editar Certificado">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg" title="Excluir Registro">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 text-sm italic">Nenhum certificado lançado para este colaborador.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-8 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-4">
             <button onClick={onClose} className="px-8 py-3 bg-slate-900 border border-slate-700 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-white hover:border-slate-500 transition-all">
               Fechar
             </button>
          </div>
        </div>
      </div>

      <AddDocumentModal 
        isOpen={isAddingDoc}
        employeeId={employee.id}
        employeeName={employee.name}
        onClose={() => setIsAddingDoc(false)}
        onSuccess={() => {
          setIsAddingDoc(false);
          onRefresh();
        }}
      />
    </>
  );
};

export default EmployeeModal;
