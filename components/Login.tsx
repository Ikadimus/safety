
import React, { useState } from 'react';
import { Cpu, Fingerprint, Mail, Loader2, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('efilho@essencisbiometano.com.br');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock de autenticação solicitado
    setTimeout(() => {
      if (email === 'efilho@essencisbiometano.com.br' && password === '123') {
        onLogin(email);
      } else {
        setError('CHAVE DE SEGURANÇA INVÁLIDA');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Grid de fundo sutil */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="z-10 w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        <div className="bg-[#020617]/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] relative text-center">
          
          {/* Decoração superior */}
          <div className="absolute top-0 right-0 p-4 opacity-40">
            <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-baseline gap-1">
              BIOMETANO <span className="text-orange-500 not-italic">Caieiras</span>
            </h1>
            
            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-3 leading-none">
              GESTÃO DE SAFETY
            </p>
            
            <div className="w-full flex items-center gap-4 mt-8 opacity-40">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                AUTENTICAÇÃO DE SEGURANÇA
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IDENTIFICAÇÃO (E-MAIL)</label>
              <div className="relative group">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f0f5ff] border-none rounded-xl px-5 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium text-sm"
                  placeholder="usuario@dominio.com.br"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SENHA DE ACESSO</label>
              <div className="relative group">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f0f5ff] border-none rounded-xl px-5 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/20 transition-all font-black text-lg tracking-widest"
                  placeholder="•••"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest animate-pulse bg-red-500/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] hover:from-[#34d399] hover:to-[#60a5fa] text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_-10px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ACESSAR SISTEMA"}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-slate-800"></span>
            Acesso Restrito • Biometano Caieiras
            <span className="w-8 h-[1px] bg-slate-800"></span>
          </p>
          <p className="text-[8px] text-slate-700 font-medium uppercase tracking-widest">
            SISTEMA CENTRAL SAFETY • © 2026 DESENVOLVIDO POR 6580005
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
