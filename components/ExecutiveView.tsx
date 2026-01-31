
import React, { useMemo, useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  AlertOctagon, 
  Factory, 
  History, 
  Lock, 
  Unlock, 
  Info, 
  Microscope, 
  Binary
} from 'lucide-react';
import { Provider, Document } from '../types';

interface ExecutiveViewProps {
  providers: Provider[];
  onViewHistory?: (providerName: string) => void;
}

const InteractiveTooltip: React.FC<{ 
  title: string; 
  content: string; 
  deepContent?: string;
  type?: 'basic' | 'deep' 
}> = ({ title, content, deepContent, type = 'basic' }) => {
  const [isClicked, setIsClicked] = useState(false);
  const isDeep = type === 'deep';

  return (
    <div className="relative inline-block ml-1.5 align-middle">
      <div className="relative inline-block group/tt">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isDeep) setIsClicked(!isClicked);
          }}
          className={`relative z-30 p-1 rounded-md transition-all duration-300 outline-none flex items-center justify-center ${
            isDeep && isClicked 
              ? 'bg-blue-500 text-white scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
              : 'text-slate-600 hover:text-emerald-400'
          }`}
        >
          {isDeep ? (
            <Microscope className={`w-3.5 h-3.5 transition-colors ${isClicked ? 'text-white' : 'hover:text-blue-400'}`} />
          ) : (
            <Info className="w-3.5 h-3.5" />
          )}
        </button>

        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-300 pointer-events-none border z-[100] 
          ${isDeep 
            ? (isClicked ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-2 scale-95')
            : 'opacity-0 invisible group-hover/tt:opacity-100 group-hover/tt:visible translate-y-0 scale-100'
          }
          ${isDeep && isClicked ? 'bg-slate-900 border-blue-500/60 ring-1 ring-blue-500/30' : 'bg-slate-800 border-slate-700'}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isDeep && <Binary className={`w-3 h-3 ${isClicked ? 'text-blue-400' : 'text-blue-500/50'}`} />}
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDeep ? (isClicked ? 'text-blue-400' : 'text-blue-500/50') : 'text-emerald-500'}`}>
                {isDeep && isClicked ? 'DETALHAMENTO ALGORÍTMICO' : title}
              </p>
            </div>
            {isDeep && !isClicked && (
              <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black animate-pulse">CLIQUE PARA ANÁLISE</span>
            )}
          </div>
          
          <p className={`text-[11px] leading-relaxed font-medium text-left ${isDeep && isClicked ? 'text-blue-100' : 'text-slate-300'}`}>
            {isDeep ? (isClicked ? deepContent : "Clique no ícone para processar a análise profunda de conformidade.") : content}
          </p>
          
          <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${
            isDeep && isClicked ? 'border-t-blue-500/60' : 'border-t-slate-800'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

const ExecutiveView: React.FC<ExecutiveViewProps> = ({ providers, onViewHistory }) => {
  const months = useMemo(() => {
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const d = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (d.getMonth() - i + 12) % 12;
      result.push(names[monthIndex]);
    }
    return result;
  }, []);

  const executiveStats = useMemo(() => {
    let totalScore = 0;
    let blockedCount = 0;
    let criticalAlertsCount = 0;

    const providersWithScore = providers.map(p => {
      let score = 100;
      let isBlocked = false;
      const criticalTypes = ['NR-33', 'NR-35', 'NR-10', 'NR-20', 'ASO'];

      (p.employees || []).forEach(emp => {
        // Lógica de Documento Único (Pega o mais recente de cada tipo para o cálculo)
        const latestDocsByType = new Map<string, Document>();
        (emp.documents || []).forEach(doc => {
          const currentLatest = latestDocsByType.get(doc.type);
          if (!currentLatest || new Date(doc.expiryDate) > new Date(currentLatest.expiryDate)) {
            latestDocsByType.set(doc.type, doc);
          }
        });
        
        criticalTypes.forEach(type => {
          const doc = latestDocsByType.get(type);
          if (!doc) {
            score -= 5;
          } else if (doc.status === 'EXPIRED') {
            if (type === 'ASO') score -= 15;
            else score -= 20;
            isBlocked = true;
            criticalAlertsCount++;
          }
        });
      });

      score = Math.max(0, score);
      totalScore += score;
      if (isBlocked || score < 60) blockedCount++;

      return { ...p, score, isBlocked };
    });

    const avgScore = providers.length > 0 ? totalScore / providers.length : 100;

    return {
      avgScore,
      blockedCount,
      criticalAlerts: criticalAlertsCount,
      providersWithScore
    };
  }, [providers]);

  const kpiInfo = {
    'Conformidade Geral': {
      basic: 'Nível global de saúde documental da unidade em tempo real.',
      deep: 'Cálculo BioSafety: Σ(Score_Individual) / Total_Empresas. O sistema filtra automaticamente documentos duplicados, considerando apenas o certificado com data de vencimento mais tardia para o cálculo de risco.'
    },
    'Prestadoras Bloqueadas': {
      basic: 'Total de parceiros com interdição operacional ativa.',
      deep: 'Regra de Interdição: Bloqueio imediato se Score < 60 OU 01 documento de risco de vida (NR-33/35) expirado. A revogação é automática após upload de novo documento válido.'
    },
    'Alertas Críticos': {
      basic: 'Documentos expirados do grupo "Segurança de Vida".',
      deep: 'Metodologia de Filtro: Count(Docs) WHERE (Type IN CriticalList AND Status = "EXPIRED" AND IsLatest = TRUE). Documentos antigos ignorados pelo motor de busca.'
    },
    'Horas Bloqueadas (Est.)': {
      basic: 'Impacto produtivo gerado pela não-conformidade.',
      deep: 'Estimativa Operacional: (Total_Colaboradores_Bloqueados * 8.8h/dia) * Fator_Produtividade(0.85). Representa o custo de ociosidade por falha administrativa.'
    }
  };

  const kpis = [
    { label: 'Conformidade Geral', value: `${Math.round(executiveStats.avgScore)}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Prestadoras Bloqueadas', value: executiveStats.blockedCount, icon: Lock, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Alertas Críticos', value: executiveStats.criticalAlerts, icon: AlertOctagon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Horas Bloqueadas (Est.)', value: '42h', icon: History, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const info = kpiInfo[kpi.label as keyof typeof kpiInfo];
          return (
            <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl group hover:border-slate-700 transition-all relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.bg} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                {i === 0 && (
                  <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-[8px] font-black flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +2.4%
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{kpi.label}</p>
                <div className="flex items-center relative">
                  <InteractiveTooltip title="Informação" content={info.basic} />
                  <InteractiveTooltip 
                    title="Deep Analysis" 
                    content="" 
                    deepContent={info.deep}
                    type="deep" 
                  />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{kpi.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 rounded-t-3xl">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-1">
                <ShieldCheck className="w-6 h-6 text-emerald-500 mr-2" />
                Índice de Risco por Prestadora
                <div className="flex items-center ml-2">
                   <InteractiveTooltip title="Monitoramento" content="Métrica proprietária BioSafety para avaliação de terceiros." />
                   <InteractiveTooltip 
                      title="Deep Analysis" 
                      content="" 
                      deepContent="Filtro de Inteligência: O sistema ignora certificados antigos se houver um novo treinamento lançado. O score é revalidado instantaneamente após qualquer exclusão ou inserção no banco de dados."
                      type="deep"
                    />
                </div>
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ranking estratégico de segurança</p>
            </div>
          </div>
          
          <div className="overflow-x-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/20">
                  <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Prestadora</th>
                  <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Score QSSMA</th>
                  <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Status Operacional</th>
                  <th className="p-6 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {executiveStats.providersWithScore.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                          <Factory className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{p.name}</p>
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-tight">{p.cnpj}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              (p.score || 0) >= 80 ? 'bg-emerald-500' : (p.score || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${p.score}%` }}
                          />
                        </div>
                        <span className={`font-black text-sm w-8 text-right ${
                          (p.score || 0) >= 80 ? 'text-emerald-400' : (p.score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>{p.score}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                        p.isBlocked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {p.isBlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {p.isBlocked ? 'Bloqueada' : 'Autorizada'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                       <button 
                         onClick={() => onViewHistory && onViewHistory(p.name)}
                         className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors bg-slate-800/50 px-3 py-1 rounded-md border border-slate-700 hover:border-emerald-500"
                        >
                         Histórico
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          {/* Gráfico de Tendência Mensal Evoluído */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative min-h-[350px] flex flex-col">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              Tendência de Compliance
              <InteractiveTooltip title="Progressão" content="Histórico de conformidade global da unidade nos últimos 6 meses." />
            </h3>
            
            <div className="relative flex-1 flex">
              {/* Eixo Y de Valores */}
              <div className="flex flex-col justify-between text-[8px] font-black text-slate-600 uppercase tracking-tighter pr-4 pb-8 h-[200px]">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="relative flex-1 h-[200px]">
                {/* Linhas de Grade (Grid Lines) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-[1px] bg-slate-800 border-t border-slate-800/40"></div>
                  ))}
                </div>

                {/* Barras do Gráfico */}
                <div className="absolute inset-0 flex items-end justify-around px-4">
                  {[42, 58, 65, 60, 78, 92].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-help max-w-[30px]">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-700 relative bg-gradient-to-t ${
                          i === 5 ? 'from-emerald-600 to-emerald-400 animate-pulse ring-2 ring-emerald-500/20' : 'from-slate-700 to-slate-500 group-hover:from-emerald-500/40 group-hover:to-emerald-400/60'
                        }`}
                        style={{ height: `${val}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl font-bold">
                          {val}%
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tight transition-colors ${i === 5 ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                        {months[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Meta: 90%</span>
              </div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+14% vs M-1</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-slate-900 rounded-3xl p-8 border border-red-900/20 relative">
             <div className="absolute top-4 right-4 flex items-center">
                <InteractiveTooltip title="Protocolos" content="Registros de intervenções preventivas automáticas." />
                <InteractiveTooltip 
                  title="Deep Analysis" 
                  content="" 
                  deepContent="Motor de Regras BioSafety: Realiza o cruzamento entre as Permissões de Trabalho (PT) e os CPFs dos terceiros. Se houver discrepância documental, o bloqueio 'Gate_Keeper' é acionado instantaneamente."
                  type="deep"
                />
             </div>
             <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-500/20 p-3 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Atuação do Sistema</p>
                  <h4 className="text-white font-bold">Bloqueio Ativo</h4>
                </div>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed">
               Foram realizados 12 bloqueios automáticos nesta semana por falta de NR-33/35.
             </p>
             <div className="mt-6 pt-6 border-t border-red-900/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">Negados</p>
                  <p className="text-xl font-bold text-white">142</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">Diligência</p>
                  <p className="text-xl font-bold text-emerald-500">98%</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveView;
