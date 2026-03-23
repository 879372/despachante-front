import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/services/api';
import type { Client, PaginatedResponse } from '@/types';
import { Search, ChevronDown, Check } from 'lucide-react';

interface ClientSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export function ClientSelect({ value, onChange, placeholder = "Todos os Clientes", className = "", buttonClassName = "" }: ClientSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!value) {
      setSelectedClientName('');
      return;
    }
    const existing = clients.find(c => String(c.id) === String(value));
    if (existing) {
      setSelectedClientName(existing.name);
    } else {
       api.get<Client>(`/clients/${value}/`).then(res => {
         setSelectedClientName(res.data.name);
         setClients(prev => {
            if (!prev.find(c => c.id === res.data.id)) return [res.data, ...prev];
            return prev;
         });
       }).catch(() => {});
    }
  }, [value, clients]);

  const loadClients = async (q: string, p: number, append = false) => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Client>>(`/clients/?search=${q}&page=${p}&page_size=10`);
      setHasMore(res.data.next !== null);
      if (append) {
        setClients(prev => {
           const newClients = res.data.results.filter(n => !prev.some(p => p.id === n.id));
           return [...prev, ...newClients];
        });
      } else {
        setClients(res.data.results);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadClients(search, 1, false);
    }, 400); 
    return () => clearTimeout(timer);
  }, [search]);

  const lastElementRef = useCallback((node: HTMLLIElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadClients(search, nextPage, true);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, search]);

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-11 px-3 text-sm font-medium bg-slate-50/50 border border-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg ${buttonClassName}`}
      >
        <span className={`truncate mr-2 ${!selectedClientName ? 'text-slate-500' : 'text-slate-900'}`}>
          {selectedClientName || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="absolute top-12 left-0 w-full min-w-[280px] max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-slate-100 relative bg-slate-50/50">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full text-sm py-2 pl-8 pr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded bg-white border border-slate-200 shadow-sm"
                placeholder="Pesquisar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            </div>
            <ul className="max-h-60 overflow-y-auto w-full p-1.5 text-sm bg-white">
              <li 
                 className="px-3 py-2 hover:bg-indigo-50 cursor-pointer rounded-lg text-slate-700 font-bold"
                 onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              >
                 Remover filtro (Todos)
              </li>
              {clients.map((client, index) => {
                const isSelected = String(client.id) === String(value);
                const isLast = index === clients.length - 1;
                return (
                  <li
                    key={client.id}
                    ref={isLast ? lastElementRef : null}
                    className={`px-3 py-2 cursor-pointer rounded-lg flex items-center justify-between truncate ${isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
                    onClick={() => { onChange(String(client.id)); setIsOpen(false); setSearch(''); }}
                  >
                    <span className="truncate">{client.name}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </li>
                );
              })}
              {loading && (
                <li className="px-3 py-2 text-slate-400 text-center text-xs animate-pulse">Carregando mais...</li>
              )}
            </ul>
          </div>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}
