import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NavbarProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/appointments': 'Gestión de Turnos',
  '/clients': 'Clientes',
  '/services': 'Servicios',
};

export function Navbar({ onMenuToggle }: NavbarProps) {
  const location = useLocation();
  const { appointments } = useAppData();
  const title = PAGE_TITLES[location.pathname] ?? 'Turnia';

  const pendingCount = appointments.filter(
    (a) => a.status === 'pending' && a.date === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <header className="h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-zinc-100 hidden md:block">{title}</h1>
        <p className="text-xs text-zinc-500 hidden md:block capitalize">{todayLabel}</p>
        <h1 className="text-base font-bold text-zinc-100 md:hidden">{title}</h1>
      </div>

      {/* Search - Desktop */}
      <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 w-56 group focus-within:border-amber-500/40 transition-all">
        <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
        <input
          className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none w-full"
          placeholder="Buscar..."
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all">
        <Bell className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse-slow" />
        )}
      </button>
    </header>
  );
}
