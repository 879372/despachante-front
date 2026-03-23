import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Process } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ClientSelect } from '@/components/ClientSelect';

export function ProcessForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const formatToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Process>>({
    client: undefined,
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
  
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing) {
      api.get<Process>(`/processes/${id}/`).then(res => setFormData(res.data));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      const val = formData[key as keyof Process];
      if (val !== undefined && val !== null && key !== 'attachment') {
        payload.append(key, String(val));
      }
    });

    if (file) {
      payload.append('attachment', file);
    }

    try {
      if (isEditing) {
        await api.put(`/processes/${id}/`, payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await api.post('/processes/', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      navigate('/processes');
    } catch (error) {
      console.error('Failed to save process', error);
      alert('Erro ao salvar processo. Verifique os dados fornecidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const inputClass = "h-11 px-3 text-sm font-medium bg-slate-50/50 border-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg";

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300 pb-10">
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
          <p className="text-sm text-slate-500">Dados técnicos, honorários e taxas.</p>
        </div>
      </div>

      <Card className="bg-white p-6 md:p-8 rounded-xl shadow-sm ring-1 ring-slate-200/50 border-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client" className="text-sm font-semibold text-slate-700">Cliente Autorizado *</Label>
              <ClientSelect value={formData.client || ''} onChange={(val) => setFormData(prev => ({...prev, client: val ? Number(val) : undefined}))} placeholder="Selecione um cliente..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_type" className="text-sm font-semibold text-slate-700">Categoria do Serviço *</Label>
              <select id="service_type" name="service_type" required value={formData.service_type || ''} onChange={handleChange} className={`flex w-full items-center justify-between outline-none ${inputClass}`}>
                <option value="Transferência">Transferência</option>
                <option value="Licenciamento">Licenciamento</option>
                <option value="Emplacamento">Emplacamento</option>
                <option value="Segunda via">Segunda via</option>
                <option value="Multa">Multa Administartiva</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate" className="text-sm font-semibold text-slate-700">Placa do Veículo *</Label>
              <Input id="plate" name="plate" required value={formData.plate || ''} onChange={handleChange} className={`uppercase font-mono tracking-widest ${inputClass}`} placeholder="ABC1D23" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renavam" className="text-sm font-semibold text-slate-700">Renavam</Label>
              <Input id="renavam" name="renavam" value={formData.renavam || ''} onChange={handleChange} className={inputClass} placeholder="Registro do veículo" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Status do Andamento *</Label>
              <select id="status" name="status" required value={formData.status || ''} onChange={handleChange} className={`flex w-full items-center justify-between outline-none ${inputClass}`}>
                <option value="Aberto">Aberto</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Aguardando cliente">Aguardando cliente</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* FINANCEIRO */}
            <div className="grid grid-cols-2 gap-3 space-y-0">
              <div className="space-y-2">
                <Label htmlFor="service_value" className="text-sm font-semibold text-slate-700">Honorários (R$) *</Label>
                <Input id="service_value" name="service_value" type="number" step="0.01" required value={formData.service_value || ''} onChange={handleChange} className={`font-semibold text-indigo-700 ${inputClass}`} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_value" className="text-sm font-semibold text-slate-700">Taxas Extras (R$) *</Label>
                <Input id="tax_value" name="tax_value" type="number" step="0.01" required value={formData.tax_value || ''} onChange={handleChange} className={`font-semibold text-orange-700 ${inputClass}`} placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status" className="text-sm font-semibold text-slate-700">Situação de Pagamento *</Label>
              <select id="payment_status" name="payment_status" required value={formData.payment_status || ''} onChange={handleChange} className={`flex w-full items-center justify-between outline-none ${inputClass}`}>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-sm font-semibold text-slate-700">Formato / Vínculo</Label>
              <Input id="payment_method" name="payment_method" value={formData.payment_method || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Pix, Dinheiro, Cartão 12x" />
            </div>

            <div className="grid grid-cols-2 gap-3 space-y-0">
              <div className="space-y-2">
                <Label htmlFor="opened_at" className="text-sm font-semibold text-slate-700">Data Base *</Label>
                <Input id="opened_at" name="opened_at" type="date" required value={formData.opened_at || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-sm font-semibold text-slate-700">Previsão Jurídica</Label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date || ''} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2 col-span-1 xl:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">Anexo do Processo (Opcional)</Label>
              <div className="flex items-center gap-4">
                <Input id="attachment" name="attachment" type="file" onChange={handleFileChange} className={`flex-1 flex file:my-auto items-center cursor-pointer ${inputClass}`} />
                {isEditing && formData.attachment && !file && (
                   <span className="text-xs text-indigo-600 font-semibold truncate max-w-[150px]">
                      Tem anexo salvo
                   </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Instruções Internas</Label>
            <textarea 
              id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} 
              className="flex min-h-[90px] w-full rounded-lg border-slate-200 bg-slate-50/50 p-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-sm"
              placeholder="Ex: Falta assinar CRV, multas a pagar separadamente..."
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={loading} className="h-12 px-8 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/30">
              <Save className="mr-2 h-5 w-5" /> Consolidar Operação
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
