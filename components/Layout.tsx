
import React from 'react';
import { LayoutDashboard, Users, FileWarning, LogOut, Factory, UserCog, Settings, BarChart3, Truck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, userEmail, userName }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'providers', label: 'Prestadores', icon: Users },
    { id: 'fleet', label: 'Frota Biometano', icon: Truck },
    { id: 'executive', label: 'Visão Executiva QSSMA', icon: BarChart3 },
    { id: 'alerts', label: 'Alertas Críticos', icon: FileWarning },
    { id: 'users', label: 'Gestão de Usuários', icon: UserCog },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const firstName = userName?.split(' ')[0] || 'Usuário';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-8 flex flex-col items-start border-b border-slate-800 bg-slate-950/20">
           <h1 className="text-xl font-black italic tracking-tighter text-white flex items-baseline gap-1">
              BIOMETANO <span className="text-orange-500 not-italic">Caieiras</span>
            </h1>
            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2 leading-none">
              BIOSAFETY
            </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider text-left leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800/40 p-4 rounded-2xl mb-4 border border-slate-700/50">
            <p className="text-[9px] text-emerald-500 mb-2 uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operador Online
            </p>
            <div className="text-slate-200 truncate space-y-0.5">
              <p className="text-xs font-black uppercase tracking-tight">{firstName}</p>
              <p className="text-[10px] text-slate-500 font-bold truncate">{userEmail}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sair do Protocolo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full scroll-smooth bg-slate-950">
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
            <h1 className="text-xs font-black text-white uppercase tracking-[0.3em]">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
        </header>
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
