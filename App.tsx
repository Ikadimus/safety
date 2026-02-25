
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProviderList from './components/ProviderList';
import FleetView from './components/FleetView';
import ExecutiveView from './components/ExecutiveView';
import EmployeeModal from './components/EmployeeModal';
import AddProviderModal from './components/AddProviderModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import UserAdmin from './components/UserAdmin';
import Settings from './components/Settings';
import Login from './components/Login';
import { dbService } from './services/dbService';
import { Provider, Employee, Document } from './types';
import { Loader2, RefreshCcw, DatabaseZap, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('bio_auth') === 'true');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('bio_user') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('bio_userName') || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<Provider | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToEdit, setEmployeeToEdit] = useState<{providerId: string, providerName: string, employee: Employee} | null>(null);

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
      setError("Falha ao conectar com o Supabase. Verifique as tabelas ou a rede.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const handleLogin = (email: string, name: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
    localStorage.setItem('bio_auth', 'true');
    localStorage.setItem('bio_user', email);
    localStorage.setItem('bio_userName', name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setUserName('');
    localStorage.removeItem('bio_auth');
    localStorage.removeItem('bio_user');
    localStorage.removeItem('bio_userName');
  };

  const handleEditProvider = (provider: Provider) => {
    setProviderToEdit(provider);
    setIsAddProviderOpen(true);
  };

  const handleCloseProviderModal = () => {
    setIsAddProviderOpen(false);
    setProviderToEdit(null);
  };

  const handleEditEmployee = (providerId: string, providerName: string, employee: Employee) => {
    setEmployeeToEdit({ providerId, providerName, employee });
  };

  const handleDashboardProviderClick = (name: string) => {
    setSearchTerm(name);
    setActiveTab('providers');
  };

  const handleNotifyCompany = (provider: Provider, employee: Employee, doc: Document) => {
    const subject = encodeURIComponent(`ALERTA DE SEGURANÇA: Documentação Vencida - ${employee.name}`);
    const body = encodeURIComponent(
      `Prezada equipe da ${provider.name},\n\n` +
      `Identificamos através da plataforma BioSafety que o documento "${doc.type}" do colaborador ${employee.name} (CPF: ${employee.cpf}) VENCEU em ${new Date(doc.expiryDate).toLocaleDateString('pt-BR')}.\n\n` +
      `Para garantir a continuidade das operações na Usina de Biometano Caieiras, solicitamos que o colaborador realize a reciclagem/atualização necessária e que o novo certificado seja enviado imediatamente para regularização do acesso.\n\n` +
      `Atenciosamente,\n` +
      `Departamento de Segurança do Trabalho - BioSafety Caieiras`
    );
    
    window.location.href = `mailto:${provider.contactEmail}?subject=${subject}&body=${body}`;
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
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-500" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Dados...</p>
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
            <RefreshCcw className="w-4 h-4 text-white" /> Tentar Novamente
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard providers={providers} onProviderClick={handleDashboardProviderClick} />;
      case 'providers':
        return (
          <ProviderList 
            providers={providers} 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddProvider={() => setIsAddProviderOpen(true)}
            onEditProvider={handleEditProvider}
            onViewEmployee={(emp) => setSelectedEmployeeId(emp.id)}
            onEditEmployee={handleEditEmployee}
            onRefresh={handleRefresh}
          />
        );
      case 'fleet':
        return <FleetView providers={providers} onRefresh={handleRefresh} />;
      case 'executive':
        return <ExecutiveView providers={providers} onViewHistory={handleDashboardProviderClick} />;
      case 'users':
        return <UserAdmin />;
      case 'settings':
        return <Settings />;
      case 'alerts':
        // LÓGICA DE ALERTA CORRIGIDA: Filtra apenas a versão MAIS RECENTE de cada tipo de documento
        const expiredAlerts = providers.flatMap(p => 
          (p.employees || []).flatMap(e => {
            const latestDocsByType = new Map<string, Document>();
            
            // Agrupa e mantém apenas o que tem o vencimento mais distante (o mais novo)
            (e.documents || []).forEach(doc => {
              const currentStored = latestDocsByType.get(doc.type);
              if (!currentStored || new Date(doc.expiryDate) > new Date(currentStored.expiryDate)) {
                latestDocsByType.set(doc.type, doc);
              }
            });

            // Converte o mapa de volta para array e filtra os que estão vencidos
            return Array.from(latestDocsByType.values())
              .filter(d => d.status === 'EXPIRED')
              .map(d => ({ provider: p, employee: e, doc: d }));
          })
        );

        return (
          <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 text-center space-y-6 animate-in fade-in duration-500">
            <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
              <span className="text-4xl font-black text-white">!</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Alertas de Segurança</h2>
              <p className="text-slate-500 mt-2 font-medium">Somente documentos com validade expirada em sua versão mais atual são exibidos aqui.</p>
            </div>
            
            <div className="pt-8 grid gap-4 max-w-4xl mx-auto">
              {expiredAlerts.length > 0 ? (
                expiredAlerts.map((alert, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-950 border border-red-900/20 rounded-2xl text-left group hover:border-red-500/40 transition-all gap-4">
                    <div className="flex-1">
                      <p className="font-black text-red-400 uppercase text-[10px] tracking-widest">{alert.doc.type} EXPIRADO (VERSÃO ATUAL)</p>
                      <p className="text-slate-200 font-bold text-lg mt-1">{alert.employee.name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{alert.provider.name} • Vencimento: {new Date(alert.doc.expiryDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button 
                      onClick={() => handleNotifyCompany(alert.provider, alert.employee, alert.doc)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95"
                    >
                      <Mail className="w-4 h-4 text-white" />
                      Notificar Empresa via E-mail
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-emerald-500 bg-emerald-500/5 p-12 rounded-[2rem] border border-emerald-500/20 font-black uppercase tracking-widest text-sm">
                  Sistema em conformidade. Todas as versões recentes dos documentos estão válidas.
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
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout} 
      userEmail={userEmail}
      userName={userName}
    >
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
        providerToEdit={providerToEdit}
        onClose={handleCloseProviderModal}
        onSuccess={() => {
          handleCloseProviderModal();
          handleRefresh();
        }}
      />

      <AddEmployeeModal
        isOpen={!!employeeToEdit}
        providerId={employeeToEdit?.providerId || ''}
        providerName={employeeToEdit?.providerName || ''}
        employeeToEdit={employeeToEdit?.employee}
        onClose={() => setEmployeeToEdit(null)}
        onSuccess={() => {
          setEmployeeToEdit(null);
          handleRefresh();
        }}
      />
    </Layout>
  );
};

export default App;
