import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Process, PaginatedResponse } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, FileText, FileDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ClientSelect } from '@/components/ClientSelect';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/utils/format';

export function ProcessList() {
  const [data, setData] = useState<PaginatedResponse<Process> | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // New filters
  const [clientFilter, setClientFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchProcesses = (query = search, p = page, client = clientFilter, payment = paymentFilter, status = statusFilter, start = startDate, end = endDate) => {
    setLoading(true);
    let url = `/processes/?page=${p}`;
    if (query) url += `&search=${query}`;
    if (client) url += `&client=${client}`;
    if (payment) url += `&payment_status=${payment}`;
    if (status) url += `&status=${status}`;
    if (start) url += `&start_date=${start}`;
    if (end) url += `&end_date=${end}`;

    api.get<PaginatedResponse<Process>>(url).then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProcesses(search, page, clientFilter, paymentFilter, statusFilter, startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, clientFilter, paymentFilter, statusFilter, startDate, endDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) {
       setPage(1); 
    } else {
       fetchProcesses(search, 1, clientFilter, paymentFilter, statusFilter, startDate, endDate);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir este processo rigorosamente?')) {
      await api.delete(`/processes/${id}/`);
      fetchProcesses(search, page, clientFilter, paymentFilter, statusFilter, startDate, endDate);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      let url = `/processes/?paginate=false`;
      if (search) url += `&search=${search}`;
      if (clientFilter) url += `&client=${clientFilter}`;
      if (paymentFilter) url += `&payment_status=${paymentFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const processRes = await api.get<PaginatedResponse<Process> | Process[]>(url);
      const processes = Array.isArray(processRes.data) ? processRes.data : processRes.data.results;

      if (processes.length === 0) {
        alert('Nenhum processo encontrado com os filtros atuais.');
        setExporting(false);
        return;
      }

      let clientName = 'Todos os Clientes';
      if (clientFilter) {
         try {
           const cRes = await api.get<{name: string}>(`/clients/${clientFilter}/`);
           clientName = cRes.data.name;
         } catch(e) {}
      }

      const doc = new jsPDF();
      
      // Header Background Strip
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 23, 'F');
      
      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text('Relatório Financeiro de Processos', 14, 15);
      
      // Client Name
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(15);
      doc.text(clientName, 14, 35);
      
      let filtrosAtivos = [];
      if (startDate || endDate) {
         filtrosAtivos.push(`${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`);
      }
      if (paymentFilter) filtrosAtivos.push(`${paymentFilter}`);
      if (statusFilter) filtrosAtivos.push(`${statusFilter}`);
      if (search) filtrosAtivos.push(`Busca: ${search}`);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      if (filtrosAtivos.length > 0) {
         doc.text(filtrosAtivos.join('  •  '), 14, 42);
      } else {
         doc.text('Todos os registros globais', 14, 42);
      }

      let totalTaxas = 0;
      let totalServico = 0;

      const tableRows = processes.map(p => {
        const serv = Number(p.service_value || 0);
        const tax = Number(p.tax_value || 0);
        const rowTotal = serv + tax;
        
        totalServico += serv;
        totalTaxas += tax;

        return [
          new Date(p.opened_at).toLocaleDateString('pt-BR'),
          p.plate,
          formatCurrency(tax),
          formatCurrency(serv),
          formatCurrency(rowTotal)
        ];
      });

      const grandTotal = totalServico + totalTaxas;

      autoTable(doc, {
        startY: 48,
        head: [['Data', 'Placa', 'Taxas', 'Serviço', 'Total']],
        body: tableRows,
        foot: [[
          'TOTAIS', 
          '-', 
          formatCurrency(totalTaxas), 
          formatCurrency(totalServico), 
          formatCurrency(grandTotal)
        ]],
        theme: 'grid',
        headStyles: { 
          fillColor: [248, 250, 252], 
          textColor: [71, 85, 105], 
          fontStyle: 'bold', 
          lineColor: [226, 232, 240], 
          lineWidth: 0.1 
        },
        bodyStyles: { 
          textColor: [51, 65, 85], 
          lineColor: [226, 232, 240] 
        },
        footStyles: { 
          fillColor: [241, 245, 249], 
          textColor: [15, 23, 42], 
          fontStyle: 'bold', 
          lineColor: [226, 232, 240], 
          lineWidth: 0.1 
        },
        alternateRowStyles: { 
          fillColor: [250, 250, 250] 
        },
        styles: { fontSize: 9, cellPadding: 4 },
      });

      doc.save(`Relatorio_${clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório PDF.');
    } finally {
      setExporting(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Aberto': 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    'Em andamento': 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    'Aguardando cliente': 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    'Finalizado': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    'Cancelado': 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  };

  const hasActiveFilters = clientFilter !== '' || paymentFilter !== '' || statusFilter !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Processos</h1>
          <p className="text-slate-500 text-sm">Lista de despachos veiculares ativos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button onClick={handleExportPDF} disabled={exporting} variant="outline" className="h-10 px-4 text-sm font-medium shadow-sm w-full md:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 leading-none">
             <FileDown className="mr-2 h-4 w-4" /> {exporting ? 'Gerando...' : 'Relatório PDF'}
          </Button>
          <Link to="/processes/new">
            <Button className="h-10 px-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all w-full md:w-auto text-white leading-none">
              <Plus className="mr-2 h-4 w-4" /> Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar placa, renavam ou doc..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="h-10 pl-9 pr-3 text-sm rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all w-full"
            />
            <Button type="submit" variant="secondary" className="h-10 px-4 rounded-lg text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 leading-none">Buscar</Button>
          </form>
          
          <Button 
            type="button" 
            variant={showFilters ? 'default' : 'outline'} 
            onClick={() => setShowFilters(!showFilters)} 
            className={`h-10 px-4 flex items-center gap-2 max-w-min leading-none rounded-lg font-medium transition-all ${
               showFilters ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white text-slate-700 shadow-sm'
            }`}
          >
            <Filter className={`w-4 h-4 ${hasActiveFilters && !showFilters ? 'text-indigo-500' : ''}`} /> 
            Filtros
            {hasActiveFilters && !showFilters && (
               <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2"></span>
            )}
          </Button>
        </div>
        
        {showFilters && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col xl:flex-row flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-full xl:w-64">
               <ClientSelect value={clientFilter} onChange={(v) => { setClientFilter(v); setPage(1); }} placeholder="Filtrar por Cliente" className="h-10 text-sm" />
            </div>
            
            <select 
               className="h-10 px-3 w-full sm:w-auto text-sm font-medium bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-700"
               value={paymentFilter}
               onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            >
               <option value="">Status Pagamento</option>
               <option value="Pendente">Pendente</option>
               <option value="Pago">Pago</option>
            </select>

            <select 
               className="h-10 px-3 w-full sm:w-auto text-sm font-medium bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-700"
               value={statusFilter}
               onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
               <option value="">Fase Atual</option>
               <option value="Aberto">Aberto</option>
               <option value="Em andamento">Em andamento</option>
               <option value="Aguardando cliente">Aguardando cliente</option>
               <option value="Finalizado">Finalizado</option>
               <option value="Cancelado">Cancelado</option>
            </select>

            <div className="flex items-center gap-2 w-full xl:w-auto xl:border-l xl:border-slate-200 xl:pl-3">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden lg:block">Data:</span>
               <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="h-10 text-xs w-full sm:w-auto bg-white" />
               <span className="text-xs text-slate-400">até</span>
               <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="h-10 text-xs w-full sm:w-auto bg-white" />
            </div>
          </div>
        )}
      </div>

      <Card className="rounded-xl border-0 shadow-sm ring-1 ring-slate-200 bg-white relative z-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Veículo/Cliente</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Serviço/Anexo</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-center">Progresso</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Custos Detalhados (R$)</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Recibo</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-full animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-full animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-5 bg-slate-200 rounded w-16 mx-auto animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-full animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-full animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-16 ml-auto animate-pulse"></div></TableCell>
                    </TableRow>
                 ))
              ) : data?.results.map((process) => {
                 const serviceVal = Number(process.service_value || 0);
                 const taxVal = Number(process.tax_value || 0);
                 const total = serviceVal + taxVal;

                 return (
                  <TableRow key={process.id} className="transition-colors hover:bg-slate-50/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200 w-max mb-1">{process.plate}</span>
                        <span className="font-medium text-slate-900 text-sm truncate max-w-[150px]">{process.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{process.service_type}</span>
                        {process.attachment && (
                          <a href={process.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                             <FileText className="w-3 h-3"/> Abrir Anexo
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`px-2 py-0.5 text-[11px] font-semibold uppercase border-0 rounded-md ${statusColors[process.status] || ''}`}>
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                       <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                             {formatCurrency(total)}
                          </span>
                          <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">S: {formatCurrency(serviceVal)} | T: {formatCurrency(taxVal)}</div>
                       </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                           Doc: {new Date(process.opened_at).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge className={`px-2 py-0.5 text-[10px] font-bold uppercase shadow-none rounded-sm ${process.payment_status === 'Pago' ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                          {process.payment_status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/processes/${process.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleDelete(process.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                 );
              })}
              {!loading && data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    Nenhum processo filtrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && data && data.count > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <span className="text-sm text-slate-500 font-medium">Mostrando página {page} (Total: {data.count} processos)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage(p => p - 1)} className="rounded-md">Anterior</Button>
              <Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage(p => p + 1)} className="rounded-md">Próxima</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
