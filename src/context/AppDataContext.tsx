import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Appointment, Client, Service, AppointmentStatus } from '@/types';
import {
  MOCK_CLIENTS,
  MOCK_SERVICES,
  MOCK_APPOINTMENTS,
  getPopulatedAppointments,
} from '@/data/mockData';
import { generateId } from '@/utils';

interface AppDataContextValue {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  // Appointments
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'client' | 'service'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  // Clients
  addClient: (data: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // Services
  addService: (data: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  toggleServiceActive: (id: string) => void;
  deleteService: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [rawAppointments, setRawAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const appointments = getPopulatedAppointments(rawAppointments, clients, services);

  // ─── Appointment Actions ───────────────────────────────────────────────────

  const addAppointment = useCallback(
    (data: Omit<Appointment, 'id' | 'createdAt' | 'client' | 'service'>) => {
      const newApt: Appointment = {
        ...data,
        id: generateId('apt'),
        createdAt: new Date().toISOString(),
      };
      setRawAppointments((prev) => [...prev, newApt]);
    },
    []
  );

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setRawAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setRawAppointments((prev) => prev.filter((apt) => apt.id !== id));
  }, []);

  // ─── Client Actions ────────────────────────────────────────────────────────

  const addClient = useCallback(
    (data: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
      const newClient: Client = {
        ...data,
        id: generateId('cli'),
        totalVisits: 0,
        createdAt: new Date().toISOString(),
      };
      setClients((prev) => [newClient, ...prev]);
    },
    []
  );

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Service Actions ───────────────────────────────────────────────────────

  const addService = useCallback((data: Omit<Service, 'id'>) => {
    const newService: Service = { ...data, id: generateId('svc') };
    setServices((prev) => [...prev, newService]);
  }, []);

  const updateService = useCallback((id: string, data: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }, []);

  const toggleServiceActive = useCallback((id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        appointments,
        clients,
        services,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        toggleServiceActive,
        deleteService,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
