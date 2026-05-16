import { clsx, type ClassValue } from 'clsx';
import type { AppointmentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    'in-progress': 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

export function getStatusColors(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'in-progress': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return colors[status];
}

export function getStatusDot(status: AppointmentStatus): string {
  const dots: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-blue-400',
    'in-progress': 'bg-emerald-400',
    completed: 'bg-zinc-400',
    cancelled: 'bg-red-400',
  };
  return dots[status];
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    corte: 'Corte',
    barba: 'Barba',
    combo: 'Combo',
    tratamiento: 'Tratamiento',
  };
  return labels[category] ?? category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    corte: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    barba: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    combo: 'bg-gold-500/10 text-amber-400 border-amber-500/20',
    tratamiento: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return colors[category] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
