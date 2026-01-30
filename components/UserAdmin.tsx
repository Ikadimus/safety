
import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck, Mail, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('app_users').select('*');
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('app_users').insert([{
        ...newUserData,
        role: 'OPERATOR'
      }]);
      if (error) throw error;
      setIsAdding(false);
      setNewUserData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err: any) {
      alert(`Erro ao cadastrar: ${err.message || 'Verifique se a tabela app_users existe no Supabase.'}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover acesso deste usuário?")) return;
    try {
      await supabase.from('app_users').delete().eq('id', id);
      fetchUsers();
    } catch (err) {
      alert("Erro ao remover usuário.");
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
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
        >
          <UserPlus className="w-4 h-4" /> Autorizar Novo Operador
        </button>
      </div>

      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Operador</th>
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">E-mail de Acesso</th>
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Nível</th>
                <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
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
                  <td className="p-6">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black tracking-widest">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-500 text-xs italic">Nenhum operador adicional cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-800 p-8">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Nova Autorização</h3>
            <form onSubmit={handleAddUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Operador</label>
                <input 
                  required
                  placeholder="Nome completo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input 
                  type="email"
                  required
                  placeholder="exemplo@empresa.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Definir Senha</label>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
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
                  onClick={() => setIsAdding(false)} 
                  className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
                >
                  Salvar Acesso
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
