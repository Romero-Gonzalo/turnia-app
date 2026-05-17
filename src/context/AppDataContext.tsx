import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import type { Appointment, Client, Service, AppointmentStatus } from '@/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface AppDataContextValue {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  isLoading: boolean;
  // Appointments
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'client' | 'service'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  // Clients
  addClient: (data: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  // Services
  addService: (data: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  toggleServiceActive: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

type FirestoreDateLike = string | { toDate: () => Date } | null | undefined;
type FirestoreSnapshot = { docs: Array<{ id: string; data: () => Record<string, unknown> }> };

const AppDataContext = createContext<AppDataContextValue | null>(null);

function toDateString(value: FirestoreDateLike) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.toDate().toISOString();
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function getCollectionPath(barbershopId: string, collectionName: 'appointments' | 'clients' | 'services') {
  return collection(db, 'barbershops', barbershopId, collectionName);
}

function mapClient(id: string, data: Record<string, unknown>): Client {
  return {
    id,
    name: String(data.name ?? ''),
    phone: String(data.phone ?? ''),
    email: typeof data.email === 'string' ? data.email : undefined,
    totalVisits: Number(data.totalVisits ?? 0),
    lastVisit: typeof data.lastVisit === 'string' ? data.lastVisit : undefined,
    createdAt: toDateString(data.createdAt as FirestoreDateLike),
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
  };
}

function mapService(id: string, data: Record<string, unknown>): Service {
  const category = ['corte', 'barba', 'combo', 'tratamiento'].includes(String(data.category))
    ? data.category as Service['category']
    : 'corte';

  return {
    id,
    name: String(data.name ?? ''),
    description: typeof data.description === 'string' ? data.description : undefined,
    duration: Number(data.duration ?? 30),
    price: Number(data.price ?? 0),
    active: Boolean(data.active ?? true),
    category,
  };
}

function mapAppointment(id: string, data: Record<string, unknown>): Appointment {
  const status = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].includes(String(data.status))
    ? data.status as AppointmentStatus
    : 'pending';

  return {
    id,
    clientId: String(data.clientId ?? ''),
    serviceId: String(data.serviceId ?? ''),
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    status,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    createdAt: toDateString(data.createdAt as FirestoreDateLike),
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setServices([]);
      setRawAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let loadedCollections = 0;
    const markCollectionLoaded = () => {
      loadedCollections += 1;
      if (loadedCollections === 3) setIsLoading(false);
    };

    const unsubscribeClients = onSnapshot(
      getCollectionPath(user.barbershopId, 'clients'),
      (snapshot: FirestoreSnapshot) => {
        const nextClients = snapshot.docs
          .map((item) => mapClient(item.id, item.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setClients(nextClients);
        markCollectionLoaded();
      },
      (error: unknown) => {
        console.error('Error loading clients from Firestore', error);
        markCollectionLoaded();
      }
    );

    const unsubscribeServices = onSnapshot(
      getCollectionPath(user.barbershopId, 'services'),
      (snapshot: FirestoreSnapshot) => {
        const nextServices = snapshot.docs
          .map((item) => mapService(item.id, item.data()))
          .sort((a, b) => a.name.localeCompare(b.name));
        setServices(nextServices);
        markCollectionLoaded();
      },
      (error: unknown) => {
        console.error('Error loading services from Firestore', error);
        markCollectionLoaded();
      }
    );

    const unsubscribeAppointments = onSnapshot(
      getCollectionPath(user.barbershopId, 'appointments'),
      (snapshot: FirestoreSnapshot) => {
        const nextAppointments = snapshot.docs
          .map((item) => mapAppointment(item.id, item.data()))
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        setRawAppointments(nextAppointments);
        markCollectionLoaded();
      },
      (error: unknown) => {
        console.error('Error loading appointments from Firestore', error);
        markCollectionLoaded();
      }
    );

    return () => {
      unsubscribeClients();
      unsubscribeServices();
      unsubscribeAppointments();
    };
  }, [user]);

  const appointments = useMemo(
    () => rawAppointments.map((apt) => ({
      ...apt,
      client: clients.find((client) => client.id === apt.clientId),
      service: services.find((service) => service.id === apt.serviceId),
    })),
    [clients, rawAppointments, services]
  );

  const getBarbershopId = useCallback(() => {
    if (!user) throw new Error('Tenés que iniciar sesión para modificar datos.');
    return user.barbershopId;
  }, [user]);

  // ─── Appointment Actions ───────────────────────────────────────────────────

  const addAppointment = useCallback(
    async (data: Omit<Appointment, 'id' | 'createdAt' | 'client' | 'service'>) => {
      const barbershopId = getBarbershopId();
      await addDoc(getCollectionPath(barbershopId, 'appointments'), removeUndefined({
        ...data,
        notes: data.notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
      }));
    },
    [getBarbershopId]
  );

  const updateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    const barbershopId = getBarbershopId();
    await updateDoc(doc(db, 'barbershops', barbershopId, 'appointments', id), { status });
  }, [getBarbershopId]);

  const deleteAppointment = useCallback(async (id: string) => {
    const barbershopId = getBarbershopId();
    await deleteDoc(doc(db, 'barbershops', barbershopId, 'appointments', id));
  }, [getBarbershopId]);

  // ─── Client Actions ────────────────────────────────────────────────────────

  const addClient = useCallback(
    async (data: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
      const barbershopId = getBarbershopId();
      await addDoc(getCollectionPath(barbershopId, 'clients'), removeUndefined({
        ...data,
        email: data.email?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        totalVisits: 0,
        createdAt: new Date().toISOString(),
      }));
    },
    [getBarbershopId]
  );

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const barbershopId = getBarbershopId();
    await updateDoc(doc(db, 'barbershops', barbershopId, 'clients', id), removeUndefined({
      name: data.name,
      phone: data.phone,
      email: data.email === undefined ? undefined : data.email.trim() || deleteField(),
      notes: data.notes === undefined ? undefined : data.notes.trim() || deleteField(),
      avatar: data.avatar,
      lastVisit: data.lastVisit,
      totalVisits: data.totalVisits,
    }));
  }, [getBarbershopId]);

  const deleteClient = useCallback(async (id: string) => {
    const barbershopId = getBarbershopId();
    await deleteDoc(doc(db, 'barbershops', barbershopId, 'clients', id));
  }, [getBarbershopId]);

  // ─── Service Actions ───────────────────────────────────────────────────────

  const addService = useCallback(async (data: Omit<Service, 'id'>) => {
    const barbershopId = getBarbershopId();
    await addDoc(getCollectionPath(barbershopId, 'services'), removeUndefined(data));
  }, [getBarbershopId]);

  const updateService = useCallback(async (id: string, data: Partial<Service>) => {
    const barbershopId = getBarbershopId();
    await updateDoc(doc(db, 'barbershops', barbershopId, 'services', id), removeUndefined({
      name: data.name,
      description: data.description === undefined ? undefined : data.description.trim() || deleteField(),
      duration: data.duration,
      price: data.price,
      active: data.active,
      category: data.category,
    }));
  }, [getBarbershopId]);

  const toggleServiceActive = useCallback(async (id: string) => {
    const service = services.find((item) => item.id === id);
    if (!service) return;
    await updateService(id, { active: !service.active });
  }, [services, updateService]);

  const deleteService = useCallback(async (id: string) => {
    const barbershopId = getBarbershopId();
    await deleteDoc(doc(db, 'barbershops', barbershopId, 'services', id));
  }, [getBarbershopId]);

  return (
    <AppDataContext.Provider
      value={{
        appointments,
        clients,
        services,
        isLoading,
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
