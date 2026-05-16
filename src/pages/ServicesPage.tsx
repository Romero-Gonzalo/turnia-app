import { useState, useMemo } from 'react';
import {
  Plus,
  Scissors,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ServiceForm } from '@/components/services/ServiceForm';
import { formatCurrency, formatDuration, getCategoryLabel, getCategoryColor, cn } from '@/utils';
import type { Service } from '@/types';

const CATEGORY_FILTERS = ['todos', 'corte', 'barba', 'combo', 'tratamiento'] as const;

export function ServicesPage() {
  const { services, toggleServiceActive, deleteService } = useAppData();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [showInactive, setShowInactive] = useState(true);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat = categoryFilter === 'todos' || s.category === categoryFilter;
      const matchActive = showInactive || s.active;
      return matchCat && matchActive;
    });
  }, [services, categoryFilter, showInactive]);

  const activeCount = services.filter((s) => s.active).length;

  const handleToggle = (id: string, active: boolean) => {
    toggleServiceActive(id);
    showToast(active ? 'Servicio desactivado.' : 'Servicio activado.', 'info');
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    showToast('Servicio eliminado.', 'info');
    setDeletingId(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards]">
        <div>
          <h2 className="page-title">Servicios</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {activeCount} activos · {services.length - activeCount} inactivos
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo servicio
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-100">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                categoryFilter === cat
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              )}
            >
              {cat === 'todos' ? 'Todos' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowInactive((v) => !v)}
            className={cn('btn-ghost text-xs', !showInactive && 'bg-zinc-800 text-zinc-200')}
          >
            <Filter className="w-3.5 h-3.5" />
            {showInactive ? 'Mostrar solo activos' : 'Mostrar todos'}
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Scissors}
            title="Sin servicios"
            description="No hay servicios en esta categoría."
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-200">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onToggle={() => handleToggle(service.id, service.active)}
              onEdit={() => handleEdit(service)}
              onDelete={() => setDeletingId(service.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ServiceForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingService={editingService}
      />
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="¿Eliminar este servicio?"
        description="Esta acción no se puede deshacer."
      />
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: Service;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ServiceCard({ service, onToggle, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 hover:border-zinc-700/60 transition-all duration-200 group flex flex-col gap-4',
        !service.active && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('badge text-[10px]', getCategoryColor(service.category))}>
              {getCategoryLabel(service.category)}
            </span>
            {!service.active && (
              <span className="badge text-[10px] bg-zinc-800/60 text-zinc-500 border-zinc-700/40">
                Inactivo
              </span>
            )}
          </div>
          <h3 className="font-bold text-zinc-100 leading-tight">{service.name}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {service.description && (
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{service.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-sm font-medium text-zinc-300">{formatDuration(service.duration)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-sm font-bold text-gradient-gold">{formatCurrency(service.price)}</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {service.active ? 'Disponible para turnos' : 'No disponible'}
        </span>
        <button
          onClick={onToggle}
          className="text-zinc-500 hover:text-amber-400 transition-colors"
          title={service.active ? 'Desactivar' : 'Activar'}
        >
          {service.active ? (
            <ToggleRight className="w-6 h-6 text-amber-400" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
