import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Clock, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import api from '@/services/api';
import type { DashboardMetrics } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Input } from '@/components/ui/input';
import { ClientSelect } from '@/components/ClientSelect';
import { formatCurrency } from '@/utils/format';

interface ExtendedMetrics extends DashboardMetrics {
  bar_chart_data: any[];
  pie_chart_data: any[];
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<ExtendedMetrics | null>(null);

  const [filterPeriod, setFilterPeriod] = useState('today');
  const [clientId, setClientId] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const activeDates = useMemo(() => {
    let start = todayStr;
    const end = todayStr;

    if (filterPeriod === 'today') {
      start = todayStr;
    } else if (filterPeriod === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (filterPeriod === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (filterPeriod === 'custom') {
      return { start: customStart, end: customEnd };
    }
    
    return { start, end };
  }, [filterPeriod, customStart, customEnd, todayStr]);

  const fetchMetrics = () => {
    const params: any = {
       start_date: activeDates.start,
       end_date: activeDates.end
    };
    if (clientId) params.client_id = clientId;

    api.get<ExtendedMetrics>('/dashboard/', { params }).then(res => setMetrics(res.data));
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDates, clientId]); 

  if (!metrics) return (
    <div className="space-y-6 animate-pulse p-2">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 set-skeleton-header">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-12 w-full md:w-[450px] bg-slate-200 rounded-xl"></div>
       </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(k => (
             <div key={k} className="h-28 bg-slate-200 rounded-xl border border-slate-100"></div>
          ))}
       </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
          <div className="h-[380px] col-span-1 lg:col-span-2 bg-slate-200 rounded-xl border border-slate-100"></div>
          <div className="h-[380px] col-span-1 bg-slate-200 rounded-xl border border-slate-100"></div>
       </div>
    </div>
  );

  const formattedValue = formatCurrency(metrics?.total_value || 0);

  const cards = [
    { 
      title: 'Total Inciados', 
      description: 'Acumulado no período',
      value: metrics.total_processes, 
      icon: FileText, 
      color: 'text-indigo-600',
      bgIcon: 'bg-indigo-100'
    },
    { 
      title: 'Em Andamento', 
      description: 'Ativos aguardando',
      value: metrics.in_progress_processes, 
      icon: Clock, 
      color: 'text-amber-600',
      bgIcon: 'bg-amber-100'
    },
    { 
      title: 'Finalizados', 
      description: 'Concluídos e entregues',
      value: metrics.finished_processes, 
      icon: CheckCircle2, 
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-100'
    },
    { 
      title: 'Faturamento Recebido', 
      description: 'Ganhos da empresa apenas',
      value: formattedValue, 
      icon: DollarSign, 
      color: 'text-violet-600',
      bgIcon: 'bg-violet-100'
    },
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm">Painel dinâmico com gráficos e filtros.</p>
         </div>

         <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
            <div className="w-full md:w-56">
               <ClientSelect 
                  value={clientId} 
                  onChange={setClientId} 
                  placeholder="Filtro: Clientes..." 
                  buttonClassName="border-0 bg-transparent !h-9 text-slate-700 hover:bg-slate-50 shadow-none px-2"
               />
            </div>
            
            <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-1">
               <Calendar className="w-4 h-4 text-slate-400 ml-1" />
               <select 
                  className="h-9 px-2 text-sm outline-none border-0 bg-transparent text-slate-700 font-medium cursor-pointer focus:ring-0"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
               >
                  <option value="today">Apenas Hoje</option>
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="custom">Personalizado</option>
               </select>
            </div>

            {filterPeriod === 'custom' && (
               <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-8 text-xs py-0" />
                  <span className="text-xs text-slate-400">até</span>
                  <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-8 text-xs py-0" />
               </div>
            )}
         </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow bg-white rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold text-slate-700">{card.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-400">{card.description}</CardDescription>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgIcon}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1">
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
         <Card className="col-span-1 lg:col-span-2 shadow-sm border-0 ring-1 ring-slate-200 rounded-xl">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg font-bold text-slate-800">Custo e Volume Mensal</CardTitle>
               <CardDescription className="text-sm">Comparação de faturamento e quantidade de processos Pendentes vs Pagos</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={metrics.bar_chart_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tickFormatter={(val) => formatCurrency(val)} className="text-xs font-medium text-slate-500" />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} className="text-xs font-medium text-slate-500" />
                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: '500' }} />
                        <Bar yAxisId="left" dataKey="pago_valor" name="Valor Pago" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                        <Bar yAxisId="left" dataKey="pendente_valor" name="Valor Pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
                        <Bar yAxisId="right" dataKey="pago_qtd" name="Qtd Pagos" fill="#34d399" radius={[4, 4, 0, 0]} barSize={10} opacity={0.7} />
                        <Bar yAxisId="right" dataKey="pendente_qtd" name="Qtd Pendentes" fill="#fcd34d" radius={[4, 4, 0, 0]} barSize={10} opacity={0.7} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="col-span-1 shadow-sm border-0 ring-1 ring-slate-200 rounded-xl">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg font-bold text-slate-800">Top 4 Clientes</CardTitle>
               <CardDescription className="text-sm">Maiores demandantes de processos no período</CardDescription>
            </CardHeader>
            <CardContent>
               {metrics.pie_chart_data.length > 0 ? (
                  <div className="h-[300px] w-full mt-4 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={metrics.pie_chart_data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {metrics.pie_chart_data.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                              ))}
                           </Pie>
                           <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value, name, props) => {
                                  return [`${value} processos (${formatCurrency(props.payload.amount)})`, name];
                              }} 
                           />
                           <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: '500' }}/>
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                     Sem informações no período.
                  </div>
               )}
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
