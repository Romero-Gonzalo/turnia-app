# ✂️ Turnia — Sistema de Gestión para Barberías

MVP profesional construido con React + TypeScript + Vite + TailwindCSS.

---

## 🚀 Instalación y ejecución local

### 1. Clonar o descomprimir el proyecto

```bash
cd turnia
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El proyecto estará disponible en: **http://localhost:5173**

### 4. Credenciales de prueba

| Campo      | Valor             |
|------------|-------------------|
| Email      | matias@turnia.app |
| Contraseña | turnia123         |

---

## 📁 Estructura del proyecto

```
turnia/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── appointments/
│   │   │   └── AppointmentForm.tsx
│   │   ├── clients/
│   │   │   └── ClientForm.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── services/
│   │   │   └── ServiceForm.tsx
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Modal.tsx
│   │       ├── Spinner.tsx
│   │       ├── StatCard.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ToastContainer.tsx
│   ├── context/
│   │   ├── AppDataContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── pages/
│   │   ├── AppointmentsPage.tsx
│   │   ├── ClientsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ServicesPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🏗️ Cómo escalar a producción

### Build de producción

```bash
npm run build
npm run preview    # para probar el build localmente
```

### Deploy en Vercel (recomendado)

```bash
npm i -g vercel
vercel
```

### Deploy en Netlify

```bash
npm run build
# Subir la carpeta /dist a Netlify
```

---

## 🔥 Conexión con Firebase (siguiente paso)

1. Instalar Firebase:

```bash
npm install firebase
```

2. Crear `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

3. Reemplazar `AuthContext` con Firebase Auth:

```typescript
// Cambiar login() para usar signInWithEmailAndPassword(auth, email, password)
// Cambiar logout() para usar signOut(auth)
```

4. Reemplazar datos mockeados con Firestore:

```typescript
// En AppDataContext: usar onSnapshot() para tiempo real
// Colecciones: /appointments, /clients, /services
// Reglas de seguridad por uid de usuario
```

---

## 💡 Mejoras para convertir en SaaS real

### Backend & Auth
- [ ] Firebase Auth o Supabase con multi-tenancy
- [ ] Row-Level Security: cada barbería solo ve sus datos
- [ ] Roles: admin, barbero, recepcionista

### Funcionalidades
- [ ] Calendario visual (FullCalendar o custom)
- [ ] Recordatorios automáticos por WhatsApp (Twilio)
- [ ] Sistema de pagos (MercadoPago / Stripe)
- [ ] Reportes con gráficos (Recharts)
- [ ] Multi-barbero: asignar turno a barbero específico
- [ ] QR de reserva para clientes

### SaaS & Monetización
- [ ] Landing page de marketing
- [ ] Sistema de planes (Free / Pro / Business)
- [ ] Onboarding wizard para nuevas barberías
- [ ] Panel de superadmin
- [ ] API pública para integraciones

### Técnico
- [ ] React Query para server state
- [ ] Zustand para client state complejo
- [ ] PWA para uso móvil offline
- [ ] Tests con Vitest + Testing Library
- [ ] CI/CD con GitHub Actions
