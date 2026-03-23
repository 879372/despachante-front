import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Processos', path: '/processes', icon: FileText },
    { name: 'Clientes', path: '/clients', icon: Users },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-white shadow-sm z-10 transition-all">
        <div className="flex h-20 items-center border-b border-slate-100 px-6 gap-3">
          <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
            <LayoutDashboard className="text-white w-5 h-5"/>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">DespachPro</span>
        </div>
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="grid items-start gap-2 text-base font-medium">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 group',
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100/50' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-red-600 font-medium transition-all hover:bg-red-50 hover:text-red-700 hover:shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            Sair do sistema
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col p-8 w-full h-screen overflow-auto bg-slate-50">
        <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-4">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
