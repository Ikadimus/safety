
import React, { useState, useEffect } from 'react';
import { Users, FileX, Clock, CheckCircle2, Factory, TrendingUp, Zap, ShieldAlert, ChevronRight } from 'lucide-react';
import { Provider } from '../types';

interface DashboardProps {
  providers: Provider[];
  onProviderClick: (providerName: string) => void;
}

const SAFETY_TIPS = [
  {
    title: "Risco de H2S",
    content: "O Gás Sulfídrico (H2S) é altamente tóxico e incolor. Certifique-se de que todos os terceiros portem detectores de quatro gases calibrados.",
    footer: "Monitoramento Contínuo"
  },
  {
    title: "Atmosferas Explosivas",
    content: "A purificação de biog biogas envolve zonas EX. Verifique se as ferramentas e lanternas dos prestadores possuem certificação Intrínseca.",
    footer: "Segurança NR-20"
  },
  {
    title: "Espaços Confinados",
    content: "Antes de qualquer entrada em tanques ou reatores, exija a PET (Permissão de Entrada e Trabalho) assinada pelo vigia e supervisor.",
    footer: "Protocolo NR-33"
  },
  {
    title: "Alta Pressão",
    content: "Linhas de biogás operam sob pressão constante. Verifique se o pessoal de manutenção possui treinamento em vasos de pressão.",
    footer: "Segurança NR-13"
  },
  {
    title: "Trabalho Quente",
    content: "Soldagens e cortes exigem isolamento da área e monitoramento de metano (CH4) em tempo real para evitar ignição acidental.",
    footer: "Prevenção de Incêndio"
  }
];

const Dashboard: React.FC<DashboardProps> = ({ providers, onProviderClick }) => {
  const [currentTip, setCurrentTip] = useState(SAFETY_TIPS[0]);
  const [alertPeriod, setAlertPeriod] = useState(30);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SAFETY_TIPS.length);
    setCurrentTip(SAFETY_TIPS[randomIndex]);
    
    const saved = localStorage.getItem('biosafety_alert_period');
    if (saved) setAlertPeriod(parseInt(saved, 10));
  }, []);

  const stats = React.useMemo(() => {
    let totalEmployees = 0;
    let expired = 0;
    let expiring = 0;
    
    providers.forEach(p => {
      (p.employees || []).forEach(e => {
        totalEmployees++;
        (e.documents || []).forEach(d => {
          if (d.status === 'EXPIRED') expired++;
          if (d.status === 'EXPIRING') expiring++;
        });
      });
    });

    return { totalEmployees, expired, expiring };
  }, [providers]);

  const cards = [
    { label: 'Fornecedores', value: providers.length, icon: Factory, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Colaboradores', value: stats.totalEmployees, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Docs Vencidos', value: stats.expired, icon: FileX, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: `A Vencer (${alertPeriod}d)`, value: stats.expiring, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bg} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ATIVO
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.label}</h3>
              <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Análise de Risco por Empresa
          </h3>
          <div className="space-y-4">
            {providers.map(p => {
              const expiredCount = (p.employees || []).reduce((acc, emp) => acc + (emp.documents || []).filter(d => d.status === 'EXPIRED').length, 0);
              return (
                <div 
                  key={p.id} 
                  onClick={() => onProviderClick(p.name)}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:bg-slate-800/80 hover:border-emerald-500/30 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/20">
                      <Factory className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{p.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-xs font-bold ${expiredCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {expiredCount} pendências
                      </p>
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${expiredCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(100, (expiredCount / 5) * 100 + 10)}%` }}
                        ></div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-2xl border border-emerald-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <Zap className="w-5 h-5 fill-current" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Segurança de Biogás</h3>
            </div>
            <p className="text-emerald-50/80 text-sm leading-relaxed font-medium">
              Lembrete Crítico: {currentTip.content}
            </p>
          </div>
          <div className="mt-8 bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">{currentTip.title}</p>
              <p className="text-[9px] mt-0.5 text-slate-400 uppercase font-bold tracking-tight">{currentTip.footer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
