import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Processos', path: '/processes', icon: FileText },
    { name: 'Clientes', path: '/clients', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Header Topbar */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-white border-b border-slate-200 shadow-sm z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
            <LayoutDashboard className="text-white w-4 h-4"/>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-800">DespachPro</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dark Overlay behind Sidebar on Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-72 flex-col bg-white shadow-2xl md:shadow-sm z-50 transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-200",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "flex"
      )}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
              <LayoutDashboard className="text-white w-5 h-5"/>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">DespachPro</span>
          </div>
          {/* Close button inside sidebar on Mobile */}
          <button className="md:hidden p-1 text-slate-400 hover:text-slate-700 transition" onClick={closeMobileMenu}>
            <X className="w-6 h-6" />
          </button>
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
                  onClick={closeMobileMenu}
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
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-red-600 font-medium transition-all hover:bg-red-50 hover:text-red-700 hover:shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 w-full h-[100dvh] overflow-x-hidden overflow-y-auto bg-slate-50 scroll-smooth">
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto h-full animate-in fade-in duration-500 slide-in-from-bottom-4">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
