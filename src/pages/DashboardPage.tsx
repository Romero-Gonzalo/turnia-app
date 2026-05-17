import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, formatDuration } from '@/utils';

export function DashboardPage() {
  const { appointments, clients } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const stats = useMemo(() => {
    const todayApts = appointments.filter((a) => a.date === todayStr);
    const pending = todayApts.filter((a) => a.status === 'pending' || a.status === 'confirmed');
    const completed = todayApts.filter((a) => a.status === 'completed');
    const cancelled = todayApts.filter((a) => a.status === 'cancelled');
    const revenue = completed.reduce((sum, a) => sum + (a.service?.price ?? 0), 0);

    return {
      todayTotal: todayApts.length,
      pending: pending.length,
      completed: completed.length,
      cancelled: cancelled.length,
      totalClients: clients.length,
      todayRevenue: revenue,
    };
  }, [appointments, clients, todayStr]);

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === todayStr)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayStr]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date > todayStr && (a.status === 'pending' || a.status === 'confirmed'))
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 5),
    [appointments, todayStr]
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]">
        <h2 className="text-2xl font-bold text-zinc-100">
          {greeting},{' '}
          <span className="text-gradient-gold">{user?.name.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-zinc-500 text-sm mt-1 capitalize">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })} · {user?.barbershopName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Turnos hoy"
          value={stats.todayTotal}
          subtitle={`${stats.pending} pendientes`}
          icon={CalendarDays}
          iconColor="text-amber-400"
          animationDelay="animate-delay-100"
        />
        <StatCard
          title="Completados"
          value={stats.completed}
          subtitle="hoy"
          icon={CheckCircle}
          iconColor="text-emerald-400"
          trend={stats.completed > 0 ? { value: `${stats.completed} hoy`, positive: true } : undefined}
          animationDelay="animate-delay-200"
        />
        <StatCard
          title="Clientes"
          value={stats.totalClients}
          subtitle="registrados"
          icon={Users}
          iconColor="text-violet-400"
          animationDelay="animate-delay-300"
        />
        <StatCard
          title="Facturado hoy"
          value={formatCurrency(stats.todayRevenue)}
          subtitle="servicios completados"
          icon={DollarSign}
          iconColor="text-cyan-400"
          animationDelay="animate-delay-400"
        />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-3 glass-card rounded-xl overflow-hidden animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-zinc-200">Turnos de hoy</h3>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {todayAppointments.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="btn-ghost text-xs gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {todayAppointments.length === 0 && (
              <div className="py-12 text-center">
                <CalendarDays className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-600">No hay turnos para hoy</p>
              </div>
            )}
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="text-center w-14 flex-shrink-0">
                  <p className="text-sm font-mono font-bold text-amber-400">{apt.time}</p>
                </div>
                <Avatar name={apt.client?.name ?? '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {apt.client?.name ?? 'Cliente desconocido'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                    {apt.service?.name}
                    {apt.service && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <Clock className="w-3 h-3" />
                        {formatDuration(apt.service.duration)}
                      </>
                    )}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Stats */}
          <div className="glass-card rounded-xl p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-zinc-200">Resumen del día</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Completados', value: stats.completed, color: 'bg-emerald-400' },
                { label: 'Pendientes', value: stats.pending, color: 'bg-amber-400' },
                { label: 'Cancelados', value: stats.cancelled, color: 'bg-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm text-zinc-400">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${stats.todayTotal > 0 ? (value / stats.todayTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-zinc-300 w-4 text-right">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="glass-card rounded-xl overflow-hidden animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-400">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-zinc-200">Próximos turnos</h3>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-zinc-600 text-center py-8">Sin turnos próximos</p>
              )}
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-300 truncate">
                      {apt.client?.name ?? '—'}
                    </p>
                    <p className="text-xs text-zinc-600 capitalize">
                      {format(new Date(apt.date + 'T00:00:00'), "EEE d/MM", { locale: es })} · {apt.time}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} showDot={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
