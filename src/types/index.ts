export interface Client {
  id: number;
  name: string;
  cpf_cnpj: string;
  phone: string;
  email?: string;
  created_at?: string;
}

export type ProcessServiceType = 'Transferência' | 'Licenciamento' | 'Emplacamento' | 'Segunda via' | 'Multa' | 'Outro';
export type ProcessStatus = 'Aberto' | 'Em andamento' | 'Aguardando cliente' | 'Finalizado' | 'Cancelado';
export type PaymentStatus = 'Pendente' | 'Pago';

export interface Process {
  id: number;
  client: number;
  client_name?: string; // from read_only serializer field
  plate: string;
  renavam?: string;
  service_type: ProcessServiceType;
  status: ProcessStatus;
  service_value: string;
  tax_value: string;
  attachment?: string;
  opened_at: string;
  due_date?: string;
  finished_at?: string;
  notes?: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  created_at?: string;
}

export interface DashboardMetrics {
  total_processes: number;
  in_progress_processes: number;
  finished_processes: number;
  total_value: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
