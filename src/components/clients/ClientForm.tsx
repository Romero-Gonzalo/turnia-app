import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import type { Client } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: Client | null;
}

export function ClientForm({ isOpen, onClose, editingClient }: ClientFormProps) {
  const { addClient, updateClient } = useAppData();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: editingClient?.name ?? '',
    phone: editingClient?.phone ?? '',
    email: editingClient?.email ?? '',
    notes: editingClient?.notes ?? '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showToast('Nombre y teléfono son requeridos.', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    if (editingClient) {
      updateClient(editingClient.id, form);
      showToast('Cliente actualizado.', 'success');
    } else {
      addClient(form);
      showToast('Cliente registrado exitosamente.', 'success');
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClient ? 'Editar cliente' : 'Nuevo cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre *</label>
          <input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre completo"
            className="input-base"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Teléfono *</label>
          <input
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+54 9 11 ..."
            className="input-base"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="cliente@email.com"
            className="input-base"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Preferencias, observaciones..."
            rows={2}
            className="input-base resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Spinner size="sm" /> Guardando...</> : editingClient ? 'Actualizar' : 'Agregar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
