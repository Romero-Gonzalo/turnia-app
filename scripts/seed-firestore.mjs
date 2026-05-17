import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const ENV_FILES = ['.env.local', '.env'];

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [rawKey, ...valueParts] = trimmed.split('=');
    const key = rawKey.trim();
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

for (const fileName of ENV_FILES) loadEnvFile(fileName);

const requiredFirebaseVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingFirebaseVars = requiredFirebaseVars.filter((key) => !process.env[key]);
if (missingFirebaseVars.length > 0) {
  throw new Error(`Faltan variables de Firebase: ${missingFirebaseVars.join(', ')}. Completá .env.local antes de ejecutar el seed.`);
}

const email = process.env.TURNIA_SEED_EMAIL;
const password = process.env.TURNIA_SEED_PASSWORD;
if (!email || !password) {
  throw new Error('Faltan TURNIA_SEED_EMAIL y TURNIA_SEED_PASSWORD. Pasalas por consola o agregalas temporalmente a .env.local.');
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

function getDefaultName(user) {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Usuario Turnia';
}

async function seed() {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = credential.user;
  const barbershopId = firebaseUser.uid;
  const barbershopName = process.env.TURNIA_BARBERSHOP_NAME || 'Mi barbería';
  const userName = process.env.TURNIA_USER_NAME || getDefaultName(firebaseUser);

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    id: firebaseUser.uid,
    name: userName,
    email: firebaseUser.email ?? email,
    role: 'admin',
    barbershopId,
    barbershopName,
    createdAt: serverTimestamp(),
  }, { merge: true });

  await setDoc(doc(db, 'barbershops', barbershopId), {
    name: barbershopName,
    ownerUid: firebaseUser.uid,
    createdAt: serverTimestamp(),
  }, { merge: true });

  await setDoc(doc(db, 'barbershops', barbershopId, 'members', firebaseUser.uid), {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? email,
    role: 'admin',
    createdAt: serverTimestamp(),
  }, { merge: true });

  const servicesRef = collection(db, 'barbershops', barbershopId, 'services');
  const servicesSnapshot = await getDocs(servicesRef);
  const seededServiceIds = ['corte-clasico', 'barba-premium', 'combo-corte-barba'];
  if (servicesSnapshot.empty) {
    const batch = writeBatch(db);
    const services = [
      {
        id: seededServiceIds[0],
        name: 'Corte clásico',
        description: 'Corte con máquina y tijera.',
        duration: 30,
        price: 8000,
        active: true,
        category: 'corte',
      },
      {
        id: seededServiceIds[1],
        name: 'Barba premium',
        description: 'Perfilado, arreglo y terminación con productos.',
        duration: 25,
        price: 6000,
        active: true,
        category: 'barba',
      },
      {
        id: seededServiceIds[2],
        name: 'Combo corte + barba',
        description: 'Servicio completo para pelo y barba.',
        duration: 50,
        price: 12000,
        active: true,
        category: 'combo',
      },
    ];

    for (const service of services) {
      const { id, ...data } = service;
      batch.set(doc(servicesRef, id), data);
    }
    await batch.commit();
  }

  const demoClientId = 'cliente-demo';
  const demoAppointmentId = 'turno-demo';
  const shouldCreateDemoData = process.env.TURNIA_SEED_DEMO_DATA !== 'false';
  if (shouldCreateDemoData) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    await setDoc(doc(db, 'barbershops', barbershopId, 'clients', demoClientId), {
      name: 'Cliente demo',
      phone: '+54 9 11 0000-0000',
      email: 'cliente.demo@example.com',
      totalVisits: 0,
      createdAt: now.toISOString(),
      notes: 'Cliente creado por npm run seed:firestore. Podés eliminarlo desde la app.',
    }, { merge: true });

    const serviceId = (await getDoc(doc(db, 'barbershops', barbershopId, 'services', seededServiceIds[0]))).exists()
      ? seededServiceIds[0]
      : servicesSnapshot.docs[0]?.id;

    if (serviceId) {
      await setDoc(doc(db, 'barbershops', barbershopId, 'appointments', demoAppointmentId), {
        clientId: demoClientId,
        serviceId,
        date: tomorrow.toISOString().slice(0, 10),
        time: '10:00',
        status: 'pending',
        notes: 'Turno demo creado por npm run seed:firestore. Podés eliminarlo desde la app.',
        createdAt: now.toISOString(),
      }, { merge: true });
    }
  }

  console.log('Seed completado. Documentos base creados o actualizados:');
  console.log(`- /users/${firebaseUser.uid}`);
  console.log(`- /barbershops/${barbershopId}`);
  console.log(`- /barbershops/${barbershopId}/members/${firebaseUser.uid}`);
  console.log(`- /barbershops/${barbershopId}/services`);
  if (process.env.TURNIA_SEED_DEMO_DATA !== 'false') {
    console.log(`- /barbershops/${barbershopId}/clients/cliente-demo`);
    console.log(`- /barbershops/${barbershopId}/appointments/turno-demo`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('No se pudo ejecutar el seed de Firestore.');
    console.error(error);
    process.exit(1);
  });
