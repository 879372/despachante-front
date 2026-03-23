import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Client } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    cpf_cnpj: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (isEditing) {
      api.get<Client>(`/clients/${id}/`).then(res => setFormData(res.data));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/clients/${id}/`, formData);
      } else {
        await api.post('/clients/', formData);
      }
      navigate('/clients');
    } catch (error) {
      console.error('Failed to save client', error);
      alert('Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = "h-11 px-3 text-sm font-medium bg-slate-50/50 border-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg";

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300 pb-10">
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-sm text-slate-500">Insira os dados cadastrais do cliente.</p>
        </div>
      </div>

      <Card className="bg-white p-6 md:p-8 rounded-xl shadow-sm ring-1 ring-slate-200/50 border-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nome / Razão Social *</Label>
              <Input id="name" name="name" required value={formData.name || ''} onChange={handleChange} className={inputClass} placeholder="Nome do cliente" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj" className="text-sm font-semibold text-slate-700">CPF ou CNPJ *</Label>
              <Input id="cpf_cnpj" name="cpf_cnpj" required value={formData.cpf_cnpj || ''} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Telefone *</Label>
              <Input id="phone" name="phone" required value={formData.phone || ''} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">E-mail</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className={inputClass} placeholder="contato@empresa.com" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={loading} className="h-11 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all">
              <Save className="mr-2 h-4 w-4" /> Salvar Cliente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
