import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  LogOut,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, getInitials } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Turnos', path: '/appointments', icon: CalendarDays },
  { label: 'Clientes', path: '/clients', icon: Users },
  { label: 'Servicios', path: '/services', icon: Scissors },
];

export function Sidebar({ isOpen, isCollapsed, onToggleCollapse, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-zinc-950 border-r border-zinc-800/60 z-40 flex flex-col transition-all duration-300 ease-in-out',
          // Desktop collapsed/expanded
          'lg:relative lg:translate-x-0',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile open/close
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center border-b border-zinc-800/60 transition-all duration-300',
            isCollapsed ? 'px-3 py-5 justify-center' : 'px-5 py-5 justify-between'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center glow-gold">
                <Scissors className="w-4 h-4 text-zinc-950" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gradient-gold">Turnia</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center glow-gold">
              <Scissors className="w-4 h-4 text-zinc-950" />
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all duration-200"
          >
            <ChevronLeft
              className={cn('w-4 h-4 transition-transform duration-300', isCollapsed && 'rotate-180')}
            />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {!isCollapsed && (
            <p className="section-label px-3 pb-2">Menú</p>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-amber-400')} />
                {!isCollapsed && <span>{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {/* Tooltip for collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs font-medium text-zinc-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={cn('border-t border-zinc-800/60 p-3', isCollapsed && 'px-2')}>
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/60 transition-all duration-200 group cursor-default',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-950">
              {user ? getInitials(user.name) : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.barbershopName}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={logout}
              className="w-full mt-1 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-all duration-200 flex justify-center"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
