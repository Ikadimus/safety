
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProviderList from './components/ProviderList';
import EmployeeModal from './components/EmployeeModal';
import AddProviderModal from './components/AddProviderModal';
import UserAdmin from './components/UserAdmin';
import Settings from './components/Settings';
import Login from './components/Login';
import { dbService } from './services/dbService';
import { Provider, Employee } from './types';
import { Loader2, RefreshCcw, DatabaseZap } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('bio_auth') === 'true');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('bio_user') || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      setError(null);
      const data = await dbService.getFullProvidersData();
      setProviders(data);
    } catch (err: any) {
      setError("Falha ao conectar com o Supabase. Verifique as credenciais.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('bio_auth', 'true');
    localStorage.setItem('bio_user', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('bio_auth');
    localStorage.removeItem('bio_user');
  };

  const selectedEmployee = React.useMemo(() => {
    if (!selectedEmployeeId) return null;
    for (const p of providers) {
      const emp = p.employees?.find(e => e.id === selectedEmployeeId);
      if (emp) return emp;
    }
    return null;
  }, [selectedEmployeeId, providers]);

  const handleRefresh = () => fetchData();

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (loading && activeTab !== 'settings') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-emerald-500">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando com Supabase...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-slate-900 rounded-[2.5rem] border border-red-900/20">
          <DatabaseZap className="w-16 h-16 text-red-500 mb-4 opacity-50" />
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Erro de Conexão</h2>
          <p className="text-slate-400 max-w-md mb-6 text-sm">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest">
            <RefreshCcw className="w-4 h-4" /> Tentar Novamente
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard providers={providers} />;
      case 'providers':
        return (
          <ProviderList 
            providers={providers} 
            onAddProvider={() => setIsAddProviderOpen(true)}
            onViewEmployee={(emp) => setSelectedEmployeeId(emp.id)}
            onRefresh={handleRefresh}
          />
        );
      case 'users':
        return <UserAdmin />;
      case 'settings':
        return <Settings />;
      case 'alerts':
        const expiredDocs = providers.flatMap(p => p.employees || []).flatMap(e => (e.documents || []).filter(d => d.status === 'EXPIRED'));
        return (
          <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 text-center space-y-6">
            <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
              <span className="text-4xl font-black">!</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Alertas de Segurança</h2>
              <p className="text-slate-500 mt-2 font-medium">Documentos expirados que exigem atenção imediata.</p>
            </div>
            
            <div className="pt-8 grid gap-4 max-w-3xl mx-auto">
              {expiredDocs.length > 0 ? (
                expiredDocs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-950 border border-red-900/20 rounded-2xl text-left group hover:border-red-500/40 transition-all">
                    <div>
                      <p className="font-black text-red-400 uppercase text-[10px] tracking-widest">{d.type} EXPIRADO</p>
                      <p className="text-slate-200 font-bold text-xl mt-1">Vencimento: {new Date(d.expiryDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20">
                      Notificar Empresa
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-emerald-500 bg-emerald-500/5 p-12 rounded-[2rem] border border-emerald-500/20 font-black uppercase tracking-widest text-sm">
                  Protocolo em conformidade. Nenhum vencimento crítico.
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userEmail={userEmail}>
      {renderContent()}
      
      {selectedEmployeeId && (
        <EmployeeModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployeeId(null)} 
          onRefresh={handleRefresh}
        />
      )}
      
      <AddProviderModal 
        isOpen={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
        onSuccess={() => {
          setIsAddProviderOpen(false);
          handleRefresh();
        }}
      />
    </Layout>
  );
};

export default App;
