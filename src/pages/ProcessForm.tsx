import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Process } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ClientSelect } from '@/components/ClientSelect';

export function ProcessForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<number | undefined>();

  const formatToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const initialProcess = (): Partial<Process> => ({
    plate: '',
    renavam: '',
    service_type: 'Transferência',
    status: 'Aberto',
    service_value: '',
    tax_value: '',
    opened_at: formatToday(),
    due_date: '',
    finished_at: '',
    notes: '',
    payment_method: '',
    payment_status: 'Pendente',
  });

  const [processes, setProcesses] = useState<Partial<Process>[]>([initialProcess()]);
  const [files, setFiles] = useState<Record<number, File | null>>({});

  useEffect(() => {
    if (isEditing) {
      api.get<Process>(`/processes/${id}/`).then(res => {
         setClientId(res.data.client);
         setProcesses([res.data]);
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert("Por favor selecione um cliente autorizando no topo da ficha.");
      return;
    }
    setLoading(true);

    try {
      if (isEditing) {
        const payload = new FormData();
        payload.append('client', String(clientId));
        Object.keys(processes[0]).forEach(key => {
          const val = processes[0][key as keyof Process];
          if (val !== undefined && val !== null && key !== 'attachment') {
            payload.append(key, String(val));
          }
        });
        if (files[0]) payload.append('attachment', files[0]);
        await api.put(`/processes/${id}/`, payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        const hasFiles = Object.values(files).some(f => f !== null);
        if (!hasFiles && processes.length > 1) {
           // Bulk create without files
           const payload = processes.map(p => ({ ...p, client: clientId }));
           await api.post('/processes/', payload);
        } else {
           // Promise.all para enviar files ou manter fallback via FormData robusto
           const requests = processes.map((p, idx) => {
             const payload = new FormData();
             payload.append('client', String(clientId));
             Object.keys(p).forEach(key => {
               const val = p[key as keyof Process];
               if (val !== undefined && val !== null && key !== 'attachment') {
                 payload.append(key, String(val));
               }
             });
             if (files[idx]) payload.append('attachment', files[idx] as File);
             return api.post('/processes/', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
           });
           await Promise.all(requests);
        }
      }
      navigate('/processes');
    } catch (error) {
      console.error('Failed to save processes', error);
      alert('Erro ao processar as ações. Confira os dados obrigatórios de cada ficha.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newProcesses = [...processes];
    newProcesses[index] = { ...newProcesses[index], [e.target.name]: e.target.value };
    setProcesses(newProcesses);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [index]: e.target.files![0] }));
    }
  };

  const inputClass = "h-10 px-3 text-sm font-medium bg-slate-50 border-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-sm";

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link to="/processes">
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-all">
               <ArrowLeft className="h-5 w-5" />
             </Button>
           </Link>
           <div className="space-y-1">
             <h1 className="text-2xl font-bold tracking-tight text-slate-900">
               {isEditing ? 'Editar Processo' : 'Novo Processo'}
             </h1>
             <p className="text-sm text-slate-500">{isEditing ? 'Atualizando as informações do sistema' : 'Lançamento individual ou em lote de múltiplos veículos.'}</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-200 border-0">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Cliente Pertencente do(s) Processo(s) *</Label>
            <ClientSelect value={clientId || ''} onChange={(val) => setClientId(val ? Number(val) : undefined)} placeholder="Pesquise o cliente de destino..." />
          </div>
        </Card>

        {processes.map((formData, index) => (
           <Card key={index} className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-200 border-0 relative">
             {processes.length > 1 && (
               <div className="absolute top-4 right-4">
                  <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => {
                     setProcesses(processes.filter((_, i) => i !== index));
                     const newFiles = {...files}; delete newFiles[index]; setFiles(newFiles);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
             )}
             
             <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Ficha de Veículo {processes.length > 1 ? `#${index + 1}` : ''}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Categoria *</Label>
                  <select name="service_type" required value={formData.service_type || ''} onChange={(e) => handleProcessChange(index, e)} className={`w-full ${inputClass}`}>
                    <option value="Transferência">Transferência</option>
                    <option value="Licenciamento">Licenciamento</option>
                    <option value="Emplacamento">Emplacamento</option>
                    <option value="Segunda via">Segunda via</option>
                    <option value="Multa">Multa Administartiva</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Placa *</Label>
                  <Input name="plate" required value={formData.plate || ''} onChange={(e) => handleProcessChange(index, e)} className={`uppercase font-mono ${inputClass}`} placeholder="ABC1D23" />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Renavam</Label>
                  <Input name="renavam" value={formData.renavam || ''} onChange={(e) => handleProcessChange(index, e)} className={inputClass} placeholder="00000000" />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Fase (Status) *</Label>
                  <select name="status" required value={formData.status || ''} onChange={(e) => handleProcessChange(index, e)} className={`w-full ${inputClass}`}>
                    <option value="Aberto">Aberto</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Aguardando cliente">Aguardando cliente</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Honorários (R$) *</Label>
                  <Input name="service_value" type="number" step="0.01" required value={formData.service_value || ''} onChange={(e) => handleProcessChange(index, e)} className={`font-semibold text-indigo-700 ${inputClass}`} placeholder="0.00" />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Taxas Extras (R$) *</Label>
                  <Input name="tax_value" type="number" step="0.01" required value={formData.tax_value || ''} onChange={(e) => handleProcessChange(index, e)} className={`font-semibold text-orange-700 ${inputClass}`} placeholder="0.00" />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Situação Pagto *</Label>
                  <select name="payment_status" required value={formData.payment_status || ''} onChange={(e) => handleProcessChange(index, e)} className={`w-full ${inputClass}`}>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Método de Pagto</Label>
                  <Input name="payment_method" value={formData.payment_method || ''} onChange={(e) => handleProcessChange(index, e)} className={inputClass} placeholder="Ex: Pix" />
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Data Abertura *</Label>
                  <Input name="opened_at" type="date" required value={formData.opened_at || ''} onChange={(e) => handleProcessChange(index, e)} className={inputClass} />
                </div>
                
                <div className="space-y-1 lg:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Anexo do Arquivo / Pasta</Label>
                  <Input name="attachment" type="file" onChange={(e) => handleFileChange(index, e)} className={`flex-1 flex file:my-1 file:border-0 file:bg-indigo-100 file:text-indigo-700 file:rounded items-center cursor-pointer ${inputClass}`} />
                </div>

                <div className="space-y-1 lg:col-span-4">
                  <Label className="text-xs font-semibold text-slate-600">Instruções ou Detalhes</Label>
                  <Input name="notes" value={formData.notes || ''} onChange={(e) => handleProcessChange(index, e)} className={inputClass} placeholder="Anotações breves..." />
                </div>

             </div>
           </Card>
        ))}

        {!isEditing && (
           <Button type="button" variant="outline" onClick={() => setProcesses([...processes, initialProcess()])} className="w-full border-dashed border-2 h-14 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 font-bold bg-transparent transition-all">
              <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Mais Um Veículo / Processo Para Este Cliente
           </Button>
        )}

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <Button type="submit" disabled={loading} className="h-12 w-full md:w-auto px-8 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all">
            <Save className="mr-2 h-5 w-5" /> Salvar Tudo
          </Button>
        </div>
      </form>
    </div>
  );
}
