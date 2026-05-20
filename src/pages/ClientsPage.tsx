import { useState, useMemo } from 'react';
import {
  Plus,
  Users,
  Search,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClientForm } from '@/components/clients/ClientForm';
import type { Client } from '@/types';

export function ClientsPage() {
  const { clients, deleteClient } = useAppData();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      ),
    [clients, search]
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      showToast('Cliente eliminado.', 'info');
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting client', error);
      showToast('No se pudo eliminar el cliente.', 'error');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards]">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{clients.length} clientes registrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-100">
        <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Users}
            title="Sin clientes"
            description={search ? 'No se encontraron resultados.' : 'Agregá tu primer cliente.'}
            action={
              !search ? (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Agregar cliente
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] animate-delay-200">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => handleEdit(client)}
              onDelete={() => setDeletingId(client.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ClientForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingClient={editingClient}
      />
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="¿Eliminar cliente?"
        description="Se eliminarán todos sus datos. Esta acción no se puede deshacer."
      />
    </div>
  );
}

// ─── Client Card ─────────────────────────────────────────────────────────────

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 hover:border-zinc-700/60 transition-all duration-200 group flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-zinc-200 truncate">{client.name}</p>
            {client.totalVisits >= 10 && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> Cliente frecuente
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-all"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="font-mono text-xs">{client.phone}</span>
          </div>
        )}
       {client.lastVisit && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="text-xs text-zinc-500">
              Última visita:{' '}
              <span className="text-zinc-400">
                {format(new Date(client.lastVisit + 'T00:00:00'), "d 'de' MMMM", { locale: es })}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Total visitas</span>
        <span className="text-lg font-bold font-mono text-gradient-gold">
          {client.totalVisits}
        </span>
      </div>

      {client.notes && (
        <div className="bg-zinc-800/40 rounded-lg p-3 text-xs text-zinc-400 italic leading-relaxed">
          "{client.notes}"
        </div>
      )}
    </div>
  );
}
