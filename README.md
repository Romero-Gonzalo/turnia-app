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

## 🔄 Si `git pull` falla por cambios locales

Si Git Bash muestra este error:

```txt
error: Your local changes to the following files would be overwritten by merge:
        package.json
Please commit your changes or stash them before you merge.
Aborting
```

significa que tenés cambios locales sin commitear en `package.json` y Git no quiere pisarlos al traer la actualización. Tenés dos caminos:

### Opción recomendada: guardar temporalmente tus cambios

```bash
git status
git stash push -m "cambios locales antes de actualizar" -- package.json package-lock.json
git pull origin master
git stash pop
```

Si `git stash pop` genera conflictos, abrí los archivos marcados por Git, dejá una sola versión válida del JSON y después ejecutá:

```bash
npm install
git add package.json package-lock.json
git commit -m "Resolver cambios locales de dependencias"
```

### Opción rápida: descartar tus cambios locales

Usá esta opción solo si no necesitás conservar lo que modificaste localmente en `package.json` o `package-lock.json`:

```bash
git restore package.json package-lock.json
git pull origin master
npm install
```

---

## 🔥 Conexión con Firebase

La base del SDK de Firebase ya está preparada en `src/lib/firebase.ts` y lee las credenciales desde variables de entorno de Vite.

### 1. Instalar dependencias

```bash
npm install
```

> Si `package-lock.json` no incluye Firebase todavía, ejecutá `npm install firebase` una vez y commiteá el lock actualizado.

### 2. Crear `.env.local`

Copiá `.env.example` a `.env.local` y reemplazá los valores con la configuración de tu Web App de Firebase:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

> Importante: el archivo debe llamarse `.env.local` con punto inicial. `env.local` no lo carga Vite automáticamente.

### 3. Servicios inicializados

Usá estos exports cuando migremos autenticación y datos:

```typescript
import { auth, db } from '@/lib/firebase';
```


### 4. Publicar reglas de Firestore

Si creaste Firestore en modo producción, primero publicá las reglas del archivo `firestore.rules`. Podés hacerlo desde Firebase Console → Firestore Database → Rules, o desde Git Bash con Firebase CLI:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project tu_project_id
```

Estas reglas permiten que el primer usuario autenticado cree automáticamente su perfil, su barbería y su membresía, y después limitan `clients`, `services` y `appointments` a miembros de esa barbería.

### 5. Crear documentos iniciales desde Git Bash

La app puede crear los documentos base cuando el usuario inicia sesión, pero también podés inicializar Firestore por consola. Completá `.env.local` con tus credenciales de Firebase y agregá temporalmente el usuario que ya creaste en Firebase Authentication:

```env
TURNIA_SEED_EMAIL=tu_usuario_auth@example.com
TURNIA_SEED_PASSWORD=tu_password_auth
TURNIA_BARBERSHOP_NAME=Mi barbería
TURNIA_SEED_DEMO_DATA=true
```

> `TURNIA_SEED_DEMO_DATA=true` crea un cliente y turno demo para que también aparezcan las subcolecciones `clients` y `appointments`. Si no querés datos demo, usá `TURNIA_SEED_DEMO_DATA=false`.

Después ejecutá:

```bash
npm run seed:firestore
```

El comando crea o actualiza estos documentos base y agrega servicios iniciales si todavía no hay servicios:

```txt
/users/{uid}
/barbershops/{uid}
/barbershops/{uid}/members/{uid}
/barbershops/{uid}/services/{serviceId}
/barbershops/{uid}/clients/cliente-demo          # si TURNIA_SEED_DEMO_DATA=true
/barbershops/{uid}/appointments/turno-demo      # si TURNIA_SEED_DEMO_DATA=true
```

> Por seguridad, no commitees `.env.local` ni compartas `TURNIA_SEED_PASSWORD`.

### 6. Qué crea la app automáticamente

Cuando un usuario de Firebase Authentication inicia sesión por primera vez, la app crea estos documentos si todavía no existen:

```txt
/users/{uid}
/barbershops/{uid}
/barbershops/{uid}/members/{uid}
```

Después, al cargar clientes, servicios o turnos desde la interfaz, Firestore crea estas subcolecciones:

```txt
/barbershops/{uid}/clients
/barbershops/{uid}/services
/barbershops/{uid}/appointments
```

### 7. Próximos pasos

1. Revisar o extender `AuthContext` si necesitás más datos de perfil:

```typescript
// Cambiar login() para usar signInWithEmailAndPassword(auth, email, password)
// Cambiar logout() para usar signOut(auth)
// Escuchar sesión con onAuthStateChanged(auth, callback)
```

2. Extender Firestore si necesitás seed por consola o datos iniciales:

```typescript
// En AppDataContext: usar getDocs/onSnapshot según convenga
// Colecciones sugeridas:
// /barbershops/{barbershopId}/appointments
// /barbershops/{barbershopId}/clients
// /barbershops/{barbershopId}/services
// Reglas de seguridad por uid de usuario y membresía de barbería
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
