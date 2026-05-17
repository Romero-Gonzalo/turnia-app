import { useState, useMemo } from 'react';
import {
  Plus,
  CalendarDays,
  Clock,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  PlayCircle,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { formatCurrency, formatDuration } from '@/utils';
import type { AppointmentStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'En curso', value: 'in-progress' },
  { label: 'Completado', value: 'completed' },
  { label: 'Cancelado', value: 'cancelled' },
];

export function AppointmentsPage() {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useAppData();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const matchSearch =
          !search ||
          a.client?.name.toLowerCase().includes(search.toLowerCase()) ||
          a.service?.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchDate = !dateFilter || a.date === dateFilter;
        return matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.time.localeCompare(b.time);
      });
  }, [appointments, search, statusFilter, dateFilter]);

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
    showToast(`Estado actualizado a "${status === 'completed' ? 'Completado' : status === 'cancelled' ? 'Cancelado' : 'En curso'}"`, 'success');
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    showToast('Turno eliminado.', 'info');
    setDeletingId(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards]">
        <div>
          <h2 className="page-title">Gestión de Turnos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{appointments.length} turnos en total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo turno
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-100">
        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o servicio..."
            className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none w-full"
          />
        </div>

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-base w-auto flex-shrink-0"
          title="Filtrar por fecha"
        />

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.value
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-200">
        {filtered.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin resultados"
            description="No hay turnos que coincidan con los filtros aplicados."
            action={
              <button onClick={() => { setSearch(''); setStatusFilter('all'); setDateFilter(''); }} className="btn-secondary">
                <Filter className="w-4 h-4" /> Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">
                    Servicio
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Fecha / Hora
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-zinc-800/20 transition-colors group">
                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={apt.client?.name ?? '?'} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {apt.client?.name ?? '—'}
                          </p>
                          <p className="text-xs text-zinc-500 truncate sm:hidden">
                            {apt.service?.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div>
                        <p className="text-sm text-zinc-300">{apt.service?.name ?? '—'}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {apt.service ? formatDuration(apt.service.duration) : '—'}
                          <span className="text-zinc-700 mx-1">·</span>
                          {apt.service ? formatCurrency(apt.service.price) : ''}
                        </p>
                      </div>
                    </td>

                    {/* Date/Time */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-mono font-semibold text-amber-400">
                        {apt.time}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {format(new Date(apt.date + 'T00:00:00'), "EEE d/MM/yy", { locale: es })}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <StatusBadge status={apt.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === 'pending' || apt.status === 'confirmed' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'in-progress')}
                              className="p-1.5 rounded-md hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-all"
                              title="Marcar en curso"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'completed')}
                              className="p-1.5 rounded-md hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-all"
                              title="Marcar completado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'cancelled')}
                              className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                        {apt.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="p-1.5 rounded-md hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-all"
                            title="Completar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingId(apt.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AppointmentForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="¿Eliminar este turno?"
        description="Esta acción no se puede deshacer."
      />
    </div>
  );
}
