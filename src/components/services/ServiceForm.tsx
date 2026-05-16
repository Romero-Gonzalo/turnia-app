import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import type { Service } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingService?: Service | null;
}

export function ServiceForm({ isOpen, onClose, editingService }: ServiceFormProps) {
  const { addService, updateService } = useAppData();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: editingService?.name ?? '',
    description: editingService?.description ?? '',
    duration: String(editingService?.duration ?? 30),
    price: String(editingService?.price ?? 0),
    category: editingService?.category ?? 'corte',
    active: editingService?.active ?? true,
  });

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showToast('Nombre y precio son requeridos.', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const data = {
      name: form.name,
      description: form.description,
      duration: parseInt(form.duration),
      price: parseFloat(form.price),
      category: form.category as Service['category'],
      active: form.active,
    };

    if (editingService) {
      updateService(editingService.id, data);
      showToast('Servicio actualizado.', 'success');
    } else {
      addService(data);
      showToast('Servicio creado exitosamente.', 'success');
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingService ? 'Editar servicio' : 'Nuevo servicio'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre *</label>
          <input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: Corte clásico"
            className="input-base"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripción breve del servicio..."
            rows={2}
            className="input-base resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Duración (min)</label>
            <input
              type="number"
              min={5}
              max={240}
              value={form.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Precio (ARS)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="input-base"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input-base"
          >
            <option value="corte">Corte</option>
            <option value="barba">Barba</option>
            <option value="combo">Combo</option>
            <option value="tratamiento">Tratamiento</option>
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => handleChange('active', !form.active)}
            className={`w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
              form.active ? 'bg-amber-500' : 'bg-zinc-700'
            } relative`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                form.active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-sm text-zinc-300">{form.active ? 'Servicio activo' : 'Servicio inactivo'}</span>
        </label>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Spinner size="sm" /> Guardando...</> : editingService ? 'Actualizar' : 'Crear servicio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
