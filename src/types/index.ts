// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barber';
  avatar?: string;
  barbershopId: string;
  barbershopName: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  lastVisit?: string;
  createdAt: string;
  notes?: string;
  avatar?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  active: boolean;
  category: 'corte' | 'barba' | 'combo' | 'tratamiento';
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // ISO
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  // Populated
  client?: Client;
  service?: Service;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalClients: number;
  monthlyRevenue: number;
  completedToday: number;
  cancelledToday: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  path: string;
  icon: string;
};

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
