
import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, Mail, Loader2, Eye, EyeOff, UserCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    // Senha não é retornada pelo banco por segurança, deixamos vazio se não quiser alterar
    setFormData({ name: user.name, email: user.email, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // Lógica de Edição
        const updateData: any = {
          name: formData.name,
          email: formData.email,
        };
        // Só atualiza a senha se o campo não estiver vazio
        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error } = await supabase
          .from('app_users')
          .update(updateData)
          .eq('id', editingUser.id);
        
        if (error) throw error;
      } else {
        // Lógica de Inserção
        const { error } = await supabase.from('app_users').insert([{
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'OPERATOR'
        }]);
        
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(`Erro no banco: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover permanentemente o acesso deste usuário?")) return;
    try {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      alert("Erro ao remover usuário. Verifique as permissões do banco.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Administração de Protocolo</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Gerencie os terminais de acesso autorizados</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-white" /> Autorizar Novo Operador
        </button>
      </div>

      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Operador</th>
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">E-mail de Acesso</th>
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  </td>
                </tr>
              ) : users.length > 0 ? users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-500 font-bold text-xs border border-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-400 text-xs font-medium">{u.email}</td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Editar Dados"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remover Operador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-slate-500 text-xs italic">Nenhum operador adicional cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-800 p-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {editingUser ? 'Editar Autorização' : 'Nova Autorização'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-white">Nome do Operador</label>
                <input 
                  required
                  placeholder="Nome completo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-white">E-mail Corporativo</label>
                <input 
                  type="email"
                  required
                  placeholder="exemplo@empresa.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-white">
                    {editingUser ? 'Nova Senha (Opcional)' : 'Definir Senha'}
                  </label>
                </div>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    placeholder={editingUser ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all border border-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> {editingUser ? 'Salvar' : 'Autorizar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;
