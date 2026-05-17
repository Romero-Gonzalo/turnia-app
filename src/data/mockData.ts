import type { User, Client, Service, Appointment } from '@/types';
import { addDays, format, subDays } from 'date-fns';

// ─── Mock User ───────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'user-001',
  name: 'Matías Romero',
  email: 'matias@turnia.app',
  role: 'admin',
  barbershopId: 'barbershop-001',
  barbershopName: 'Barber & Co.',
};

export const MOCK_CREDENTIALS = {
  email: 'matias@turnia.app',
  password: 'turnia123',
};

// ─── Mock Clients ────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Lucas Fernández',
    phone: '+54 9 11 4523-7890',
    email: 'lucas.f@email.com',
    totalVisits: 14,
    lastVisit: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
    notes: 'Prefiere corte clásico con navaja en los costados.',
  },
  {
    id: 'cli-002',
    name: 'Tomás Aguirre',
    phone: '+54 9 11 6734-2211',
    email: 'tomas.a@email.com',
    totalVisits: 8,
    lastVisit: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 120), 'yyyy-MM-dd'),
  },
  {
    id: 'cli-003',
    name: 'Nicolás Herrera',
    phone: '+54 9 11 2345-6789',
    totalVisits: 22,
    lastVisit: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 365), 'yyyy-MM-dd'),
    notes: 'Cliente VIP. Le gusta el fade alto.',
  },
  {
    id: 'cli-004',
    name: 'Sebastián Ortiz',
    phone: '+54 9 11 9876-5432',
    email: 'seba.o@email.com',
    totalVisits: 5,
    lastVisit: format(subDays(new Date(), 21), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
  },
  {
    id: 'cli-005',
    name: 'Diego Morales',
    phone: '+54 9 11 1234-5678',
    email: 'diego.m@email.com',
    totalVisits: 31,
    lastVisit: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 500), 'yyyy-MM-dd'),
    notes: 'Viene cada semana. Corte + barba siempre.',
  },
  {
    id: 'cli-006',
    name: 'Alejandro Ríos',
    phone: '+54 9 11 7654-3210',
    totalVisits: 2,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  },
  {
    id: 'cli-007',
    name: 'Martín Vega',
    phone: '+54 9 11 5555-4444',
    email: 'martin.v@email.com',
    totalVisits: 17,
    lastVisit: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 240), 'yyyy-MM-dd'),
  },
  {
    id: 'cli-008',
    name: 'Franco Ibáñez',
    phone: '+54 9 11 3333-2222',
    totalVisits: 9,
    lastVisit: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    createdAt: format(subDays(new Date(), 150), 'yyyy-MM-dd'),
    notes: 'Alérgico a algunos productos. Usar solo línea Proraso.',
  },
];

// ─── Mock Services ───────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-001',
    name: 'Corte Clásico',
    description: 'Corte con tijera y máquina. Incluye lavado y peinado.',
    duration: 30,
    price: 3500,
    active: true,
    category: 'corte',
  },
  {
    id: 'svc-002',
    name: 'Fade Premium',
    description: 'Degradado alto, medio o bajo. Perfilado y lineup.',
    duration: 45,
    price: 4500,
    active: true,
    category: 'corte',
  },
  {
    id: 'svc-003',
    name: 'Arreglo de Barba',
    description: 'Perfilado, recorte y hidratación de barba.',
    duration: 20,
    price: 2000,
    active: true,
    category: 'barba',
  },
  {
    id: 'svc-004',
    name: 'Afeitado con Navaja',
    description: 'Afeitado completo con navaja, toalla caliente y productos premium.',
    duration: 30,
    price: 2800,
    active: true,
    category: 'barba',
  },
  {
    id: 'svc-005',
    name: 'Combo Ejecutivo',
    description: 'Corte clásico + arreglo de barba. El más solicitado.',
    duration: 50,
    price: 5200,
    active: true,
    category: 'combo',
  },
  {
    id: 'svc-006',
    name: 'Combo Full',
    description: 'Fade premium + afeitado con navaja + hidratación.',
    duration: 75,
    price: 7000,
    active: true,
    category: 'combo',
  },
  {
    id: 'svc-007',
    name: 'Tratamiento Capilar',
    description: 'Hidratación profunda y tratamiento anticaída.',
    duration: 40,
    price: 4000,
    active: false,
    category: 'tratamiento',
  },
  {
    id: 'svc-008',
    name: 'Kids Cut',
    description: 'Corte para niños hasta 12 años.',
    duration: 25,
    price: 2500,
    active: true,
    category: 'corte',
  },
];

// ─── Mock Appointments ───────────────────────────────────────────────────────

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    clientId: 'cli-003',
    serviceId: 'svc-005',
    date: today,
    time: '09:00',
    status: 'completed',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-002',
    clientId: 'cli-001',
    serviceId: 'svc-002',
    date: today,
    time: '10:00',
    status: 'in-progress',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-003',
    clientId: 'cli-005',
    serviceId: 'svc-006',
    date: today,
    time: '11:30',
    status: 'confirmed',
    notes: 'Vino ayer sin turno, acordar horario fijo.',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-004',
    clientId: 'cli-007',
    serviceId: 'svc-001',
    date: today,
    time: '12:00',
    status: 'confirmed',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-005',
    clientId: 'cli-002',
    serviceId: 'svc-003',
    date: today,
    time: '14:00',
    status: 'pending',
    createdAt: today,
  },
  {
    id: 'apt-006',
    clientId: 'cli-004',
    serviceId: 'svc-005',
    date: today,
    time: '15:30',
    status: 'pending',
    createdAt: today,
  },
  {
    id: 'apt-007',
    clientId: 'cli-008',
    serviceId: 'svc-001',
    date: today,
    time: '16:00',
    status: 'cancelled',
    notes: 'Canceló por WhatsApp.',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-008',
    clientId: 'cli-006',
    serviceId: 'svc-004',
    date: today,
    time: '17:00',
    status: 'pending',
    createdAt: today,
  },
  // Tomorrow
  {
    id: 'apt-009',
    clientId: 'cli-001',
    serviceId: 'svc-006',
    date: tomorrow,
    time: '10:00',
    status: 'confirmed',
    createdAt: today,
  },
  {
    id: 'apt-010',
    clientId: 'cli-003',
    serviceId: 'svc-002',
    date: tomorrow,
    time: '11:00',
    status: 'confirmed',
    createdAt: today,
  },
  {
    id: 'apt-011',
    clientId: 'cli-005',
    serviceId: 'svc-005',
    date: tomorrow,
    time: '15:00',
    status: 'pending',
    createdAt: today,
  },
  // Yesterday
  {
    id: 'apt-012',
    clientId: 'cli-007',
    serviceId: 'svc-005',
    date: yesterday,
    time: '09:30',
    status: 'completed',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-013',
    clientId: 'cli-002',
    serviceId: 'svc-001',
    date: yesterday,
    time: '11:00',
    status: 'completed',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'apt-014',
    clientId: 'cli-008',
    serviceId: 'svc-008',
    date: twoDaysAgo,
    time: '10:00',
    status: 'completed',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
  },
];

// ─── Populate Appointments ────────────────────────────────────────────────────

export const getPopulatedAppointments = (
  appointments: Appointment[],
  clients: Client[],
  services: Service[]
): Appointment[] => {
  return appointments.map((apt) => ({
    ...apt,
    client: clients.find((c) => c.id === apt.clientId),
    service: services.find((s) => s.id === apt.serviceId),
  }));
};
