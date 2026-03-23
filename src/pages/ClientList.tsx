import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Client, PaginatedResponse } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function ClientList() {
  const [data, setData] = useState<PaginatedResponse<Client> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchClients = (query = search, p = page) => {
    setLoading(true);
    let url = `/clients/?page=${p}`;
    if (query) url += `&search=${query}`;
    api.get<PaginatedResponse<Client>>(url).then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else fetchClients(search, 1);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente definitivamente? Toda sua dependência deverá ser excluída antes.')) {
      await api.delete(`/clients/${id}/`);
      fetchClients(search, page);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm">Gerencie a lista de clientes autorizados</p>
        </div>
        <Link to="/clients/new">
          <Button className="h-10 px-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all w-full md:w-auto text-white">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-2 pt-2">
         <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Nome, documento, telefone, email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="h-10 pl-9 pr-3 text-sm rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all w-full"
            />
            <Button type="submit" variant="secondary" className="h-10 px-4 rounded-lg text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">Buscar</Button>
         </form>
      </div>

      <Card className="rounded-xl border-0 shadow-sm ring-1 ring-slate-200 bg-white relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Cliente/Responsável</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">CPF/CNPJ</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Telefone</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</TableHead>
                <TableHead className="h-10 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                       <TableCell className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div></TableCell>
                       <TableCell className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-16 ml-auto animate-pulse"></div></TableCell>
                    </TableRow>
                 ))
              ) : data?.results.map((client) => (
                <TableRow key={client.id} className="transition-colors hover:bg-slate-50/50">
                  <TableCell className="px-4 py-3 font-medium text-slate-900 text-sm whitespace-nowrap">{client.name}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{client.cpf_cnpj}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{client.phone}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{client.email || <span className="text-slate-400 italic">Não informado</span>}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/clients/${client.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-slate-500 text-sm">Nenhum cliente cadastrado em base aos filtros.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && data && data.count > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <span className="text-sm text-slate-500 font-medium">Mostrando página {page} (Total: {data.count} clientes)</span>
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
