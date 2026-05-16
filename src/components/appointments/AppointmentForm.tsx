import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import type { Appointment, AppointmentStatus } from '@/types';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/Spinner';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment?: Appointment | null;
}

export function AppointmentForm({ isOpen, onClose, editingAppointment }: AppointmentFormProps) {
  const { clients, services, addAppointment } = useAppData();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    clientId: editingAppointment?.clientId ?? '',
    serviceId: editingAppointment?.serviceId ?? '',
    date: editingAppointment?.date ?? format(new Date(), 'yyyy-MM-dd'),
    time: editingAppointment?.time ?? '09:00',
    notes: editingAppointment?.notes ?? '',
    status: (editingAppointment?.status ?? 'pending') as AppointmentStatus,
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.serviceId || !form.date || !form.time) {
      showToast('Completá todos los campos requeridos.', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    addAppointment({
      clientId: form.clientId,
      serviceId: form.serviceId,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: form.status,
    });
    showToast('Turno creado exitosamente.', 'success');
    setIsSubmitting(false);
    onClose();
    setForm({ clientId: '', serviceId: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', notes: '', status: 'pending' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAppointment ? 'Editar turno' : 'Nuevo turno'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Cliente *
          </label>
          <select
            value={form.clientId}
            onChange={(e) => handleChange('clientId', e.target.value)}
            className="input-base"
            required
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Servicio *
          </label>
          <select
            value={form.serviceId}
            onChange={(e) => handleChange('serviceId', e.target.value)}
            className="input-base"
            required
          >
            <option value="">Seleccionar servicio...</option>
            {services.filter((s) => s.active).map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.duration}min</option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Fecha *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="input-base"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Hora *
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="input-base"
              required
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Estado
          </label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="input-base"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in-progress">En curso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Notas
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observaciones opcionales..."
            rows={2}
            className="input-base resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Spinner size="sm" /> Guardando...</> : 'Guardar turno'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
