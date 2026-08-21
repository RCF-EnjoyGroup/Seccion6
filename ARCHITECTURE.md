# EduPlatform — Documentación de Arquitectura y Detalles Técnicos/Funcionales

---

## 1. Visión General

**EduPlatform** es una plataforma EdTech de cursos online (estilo Udemy/Gumroad) que conecta instructores con estudiantes en un ecosistema digital escalable y seguro.

- **Stack Principal**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend & Data**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Pagos**: Stripe Checkout + Stripe Connect (payouts futuros)
- **Testing**: Vitest + Testing Library

---

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Navegador)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  Landing    │  │  Catálogo   │  │  Player     │  │  Dashboards     │   │
│  │  (SSG/ISR)  │  │  (ISR)      │  │  (CSR)      │  │  (SSR/CSR)      │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
└─────────┼────────────────┼────────────────┼─────────────────┼─────────────┘
          │                │                │                 │
          ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 16 (APP ROUTER)                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Server Components│  │ Server Actions   │  │ Route Handlers (API)     │  │
│  │ (RSC)            │  │ (Mutaciones)     │  │ - Stripe Webhook         │  │
│  │ - Queries        │  │ - Enrollments    │  │ - Certificate Download   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Middleware (Auth) — Protege rutas privadas, refresca sesión          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬────────────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   SUPABASE       │    │   SUPABASE       │    │   STRIPE         │
│   POSTGRESQL     │    │   STORAGE        │    │   CHECKOUT       │
│   ┌────────────┐ │    │   ┌────────────┐ │    │   ┌────────────┐ │
│   │ Tablas &   │ │    │   │ Buckets:   │ │    │   │ Sessions   │ │
│   │ RLS        │ │    │   │ - thumbs   │ │    │   │ Webhooks   │ │
│   │ Functions  │ │    │   │ - videos   │ │    │   │ Connect    │ │
│   │ Triggers   │ │    │   │ - attach   │ │    │   └────────────┘ │
│   └────────────┘ │    │   │ - certs    │ │    └──────────────────┘
│   └──────────────┘    │   └────────────┘ │
└───────────────────────┴──────────────────┴────────────────────┘
```

---

## 3. Modelo de Datos (Esquema Supabase)

### 3.1 Enums

| Enum | Valores | Descripción |
|------|---------|-------------|
| `user_role` | `student`, `instructor`, `admin` | Rol del usuario |
| `course_status` | `draft`, `published` | Estado del curso |
| `course_level` | `beginner`, `intermediate`, `advanced` | Nivel de dificultad |
| `lesson_type` | `video`, `text`, `quiz` | Tipo de lección |
| `transaction_status` | `pending`, `completed`, `failed`, `paid_out` | Estado de transacción |

### 3.2 Tablas Principales

#### `profiles` — Perfil público (1:1 con `auth.users`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK, FK → `auth.users(id)` |
| `role` | `user_role` | Rol: student/instructor/admin |
| `onboarded` | `boolean` | Completó onboarding |
| `full_name` | `text` | Nombre completo |
| `avatar_url` | `text` | URL avatar |
| `bio` | `text` | Biografía |
| `headline` | `text` | Titular profesional |
| `website_url` / `twitter_url` / `linkedin_url` | `text` | Redes sociales |
| `stripe_account_id` | `text` | Cuenta Stripe Connect |
| `stripe_account_ready` | `boolean` | Cuenta lista para payouts |
| `balance_available` | `numeric(10,2)` | Saldo disponible para retiro |

#### `courses` — Cursos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `instructor_id` | `uuid` | FK → `profiles(id)` |
| `title` | `text` | Título |
| `slug` | `text` | Slug único (SEO) |
| `description` / `short_description` | `text` | Descripciones |
| `thumbnail_url` | `text` | Imagen de portada |
| `category` | `text` | Categoría |
| `level` | `course_level` | Nivel |
| `price` | `numeric(10,2)` | Precio (≥ 0) |
| `status` | `course_status` | draft/published |
| `language` | `text` | Idioma (default: 'es') |
| `rating_average` | `numeric(3,2)` | Promedio denormalizado |
| `rating_count` | `integer` | Conteo denormalizado |
| `student_count` | `integer` | Estudiantes inscritos |

#### `sections` — Secciones del curriculum
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `course_id` | `uuid` | FK → `courses(id)` |
| `title` | `text` | Título de la sección |
| `position` | `integer` | Orden (drag & drop) |

#### `lessons` — Lecciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `section_id` | `uuid` | FK → `sections(id)` |
| `title` | `text` | Título |
| `type` | `lesson_type` | video/text/quiz |
| `content_url` | `text` | URL video (Storage o externo) |
| `content_text` | `text` | Contenido enriquecido (texto) |
| `attachment_url` | `text` | Adjunto descargable |
| `duration_seconds` | `integer` | Duración |
| `position` | `integer` | Orden en sección |
| `is_free_preview` | `boolean` | Preview gratis |

#### `quiz_questions` — Preguntas de quiz
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `lesson_id` | `uuid` | FK → `lessons(id)` |
| `question` | `text` | Pregunta |
| `options` | `jsonb` | Array de opciones |
| `correct_option` | `integer` | Índice correcto |
| `position` | `integer` | Orden |

#### `enrollments` — Inscripciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `student_id` | `uuid` | FK → `profiles(id)` |
| `course_id` | `uuid` | FK → `courses(id)` |
| `purchased_at` | `timestamptz` | Fecha compra |
| `amount_paid` | `numeric(10,2)` | Monto pagado |
| `stripe_checkout_session_id` | `text` | ID sesión Stripe |
| `progress_percent` | `integer` | 0–100 |
| `completed_at` | `timestamptz` | Fecha finalización |

#### `lesson_progress` — Progreso por lección
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `student_id` | `uuid` | FK → `profiles(id)` |
| `lesson_id` | `uuid` | FK → `lessons(id)` |
| `completed_at` | `timestamptz` | Completada |
| `last_position_seconds` | `integer` | Posición video |
| `updated_at` | `timestamptz` | Última actualización |

#### `reviews` — Reseñas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `student_id` | `uuid` | FK → `profiles(id)` |
| `course_id` | `uuid` | FK → `courses(id)` |
| `rating` | `smallint` | 1–5 |
| `comment` | `text` | Comentario opcional |

#### `certificates` — Certificados
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `student_id` | `uuid` | FK → `profiles(id)` |
| `course_id` | `uuid` | FK → `courses(id)` |
| `issued_at` | `timestamptz` | Emisión |
| `verification_code` | `text` | Código único (hex 16 chars) |
| `pdf_url` | `text` | URL PDF en Storage |

#### `transactions` — Transacciones económicas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `instructor_id` | `uuid` | FK → `profiles(id)` |
| `student_id` | `uuid` | FK → `profiles(id)` (nullable) |
| `course_id` | `uuid` | FK → `courses(id)` (nullable) |
| `enrollment_id` | `uuid` | FK → `enrollments(id)` (nullable) |
| `amount` | `numeric(10,2)` | Total |
| `platform_fee` | `numeric(10,2)` | Comisión plataforma |
| `instructor_earnings` | `numeric(10,2)` | Ganancia instructor |
| `status` | `transaction_status` | Estado |
| `stripe_payment_intent_id` | `text` | ID Stripe |
| `stripe_transfer_id` | `text` | ID transferencia Connect |

---

## 4. Seguridad — Row Level Security (RLS)

**Cobertura**: 100% de tablas con datos sensibles.

### Funciones Auxiliares (Security Definer)
```sql
is_admin()                    -- ¿Es admin?
is_course_instructor(course)  -- ¿Es dueño del curso?
is_enrolled(course)           -- ¿Está inscrito?
```

### Políticas Clave

| Tabla | Select | Insert/Update/Delete |
|-------|--------|----------------------|
| `profiles` | Público | Solo propio |
| `courses` | Publicados + dueño + admin | Dueño (instructor/admin) |
| `sections` | Publicados + dueño + admin | Dueño/admin |
| `lessons` | Publicados + dueño + admin | Dueño/admin |
| `quiz_questions` | Dueño/inscrito/admin | Dueño/admin |
| `enrollments` | Propio + instructor + admin | **Solo service role** (webhook) |
| `lesson_progress` | Propio + instructor + admin | Propio (si inscrito) |
| `reviews` | Público | Inscrito (insert), propio (update/delete) |
| `certificates` | Propio + instructor + admin | **Solo service role** |
| `transactions` | Instructor/estudiante/admin | **Solo service role** |

### Storage Buckets & Políticas

| Bucket | Público | Acceso Lectura | Acceso Escritura |
|--------|---------|----------------|------------------|
| `course-thumbnails` | ✅ | Público | Instructor dueño |
| `lesson-videos` | ❌ | Dueño / Inscrito / Admin | Instructor dueño |
| `lesson-attachments` | ❌ | Dueño / Inscrito / Admin | Instructor dueño |
| `certificates` | ❌ | Propio estudiante / Admin | **Solo service role** |

---

## 5. Lógica de Negocio (Triggers & Funciones)

### 5.1 `handle_new_user()` — Trigger `auth.users`
Crea fila en `profiles` al registrarse (email/password u OAuth).

### 5.2 `set_updated_at()` — Trigger genérico
Actualiza `updated_at` en `profiles`, `courses`, `reviews`.

### 5.3 `recalc_enrollment_progress()` — Trigger `lesson_progress`
- Recalcula `% progreso` del curso tras cada lección completada
- Dispara `issue_certificate_if_complete()` al llegar a 100%

### 5.4 `issue_certificate_if_complete()` — Función
- Reserva `verification_code` único (`gen_random_bytes(8)` → hex)
- Generación PDF real ocurre en Next.js (`@react-pdf/renderer`)

### 5.5 `recalc_course_rating()` — Trigger `reviews`
- Actualiza `rating_average` y `rating_count` denormalizados en `courses`

### 5.6 `recalc_course_student_count()` — Trigger `enrollments`
- Actualiza `student_count` denormalizado en `courses`

### 5.7 `increment_instructor_balance()` — Función
- Incremento atómico de `balance_available` (webhook Stripe)

---

## 6. Módulos Funcionales

### 6.1 Autenticación & Onboarding
- **Supabase Auth**: Email/password + OAuth (Google, GitHub)
- **Middleware Next.js**: Protege rutas privadas, sincroniza JWT con RLS
- **Onboarding**: Selección de rol → `profiles.role` → Redirección a dashboard correspondiente

### 6.2 Catálogo & Descubrimiento (Público)
- **Landing**: Cursos destacados, categorías (SSG/ISR)
- **Catálogo**: Filtros (categoría, nivel, precio, rating, duración), búsqueda, paginación (ISR)
- **Detalle Curso**: Temario público, instructor, reseñas, CTA compra (ISR)

### 6.3 Creación de Cursos (Instructor)
- **Información básica**: Título, descripción, categoría, nivel, precio, imagen
- **Editor Curriculum**: `@dnd-kit` para drag & drop de secciones/lecciones
- **Tipos de lección**:
  - Video: Upload a Storage / URL externa (YouTube, Vimeo)
  - Texto: Editor enriquecido (TipTap o similar)
  - Quiz: Preguntas opción múltiple
  - Adjuntos: PDF, ZIP (Storage)
- **Preview**: Vista estudiante
- **Publicación**: Cambio `status: draft → published`

### 6.4 Pagos & Checkout
- **Stripe Checkout**: Sesión de pago único
- **Cupones**: Descuentos configurables
- **Webhook** (`checkout.session.completed`):
  - Valida firma (`STRIPE_WEBHOOK_SECRET`)
  - Crea `enrollment` + `transaction` (service role)
  - Incrementa `instructor.balance_available`
- **Historial**: Transacciones por instructor/estudiante

### 6.5 Player de Aprendizaje (Estudiante)
- **Acceso**: Solo si `enrollment` existe (RLS + Storage policies)
- **Video Player**: Seguimiento posición (`last_position_seconds`)
- **Marcar completada**: Server Action → `lesson_progress` → Trigger recalcula progreso
- **Progreso curso**: Barra % en sidebar
- **Adjuntos**: Descarga protegida

### 6.6 Certificados
- **Emisión**: Automática al 100% (trigger DB reserva código)
- **PDF**: Generado en Next.js (`@react-pdf/renderer`) → Subido a Storage `certificates/`
- **Verificación pública**: Página `/certificates/[verification_code]` (sin auth)
- **Contenido**: Nombre estudiante, curso, instructor, fecha, código único

### 6.7 Reseñas & Valoraciones
- **Crear**: Solo estudiantes inscritos (RLS)
- **Lectura**: Pública (catálogo, detalle)
- **Denormalización**: Trigger actualiza `courses.rating_average/count`

### 6.8 Dashboards

#### Instructor
- Métricas: Ingresos totales/por curso, estudiantes, rating
- Gestión cursos: CRUD, publicar/despublicar
- Curriculum editor
- Payouts: Saldo, solicitar retiro (Stripe Connect — futuro)

#### Estudiante
- Mis cursos: Progreso, continuar aprendiendo
- Certificados obtenidos
- Historial compras

#### Admin (Estructura lista, sin UI completa)
- Moderación contenido
- Gestión usuarios
- Transacciones globales
- Configuración plataforma (comisión, mínimos payout)

---

## 7. Flujos Principales

### 7.1 Registro & Onboarding
```
Landing → Registrarse → Supabase Auth (email/OAuth)
  → Trigger handle_new_user() → profiles (role=student)
  → Onboarding: Elige rol (instructor/estudiante)
  → Actualiza profiles.role + onboarded=true
  → Redirect: /instructor o /estudiante
```

### 7.2 Creación de Curso
```
Dashboard Instructor → "Nuevo curso"
  → Form básico → courses (draft)
  → Editor curriculum: sections + lessons (drag&drop)
  → Upload contenido → Storage (videos, attach, thumbs)
  → Preview modo estudiante
  → Publicar → courses.status = 'published'
  → Aparece en catálogo (ISR revalida)
```

### 7.3 Compra de Curso
```
Catálogo → Detalle curso → "Comprar"
  → Stripe Checkout Session (Server Action)
  → Redirect Stripe → Pago
  → Webhook checkout.session.completed
    → Valida firma
    → Crea enrollment + transaction
    → Incrementa instructor.balance_available
  → Redirect éxito → Primera lección
```

### 7.4 Consumo de Contenido
```
Dashboard Estudiante → "Mis cursos" → Curso → Player
  → Video/Texto/Quiz (contenido protegido RLS + Storage)
  → "Marcar completada" → Server Action → lesson_progress
  → Trigger recalc_enrollment_progress()
    → Actualiza enrollment.progress_percent
    → Si 100% → issue_certificate_if_complete()
  → Certificado disponible en /certificates/[code]
```

---

## 8. Requisitos No Funcionales

| Categoría | Requisito |
|-----------|-----------|
| **Rendimiento** | TTFB < 200ms (páginas públicas), LCP < 2.5s, Lighthouse > 90 (Perf/SEO), Video start < 3s @ 10Mbps |
| **Seguridad** | HTTPS obligatorio, Secrets solo env server, RLS 100% tablas sensibles, Validación sesión en API, Webhooks Stripe con firma, Validación MIME/tamaño uploads |
| **Escalabilidad** | 10k usuarios concurrentes, Índices en slug, instructor_id, student_id, status, Paginación obligatoria en listados |
| **Disponibilidad** | 99.9% uptime mensual, Reintentos webhooks Stripe, Backups DB diarios (30 días) |
| **Usabilidad/Accesibilidad** | Responsive mobile/tablet/desktop, WCAG 2.1 AA, Navegación teclado, Screen readers, Skeletons/loading states |
| **Mantenibilidad** | Principios SOLID, Clean Architecture, Types estrictos (no `any`), Tests unitarios (Vitest), ESLint + Prettier |

---

## 9. Estructura del Proyecto

```
PlatformEdu-ASB/
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql       # Esquema, enums, tablas, índices
│       ├── 0002_rls.sql        # RLS policies + helper functions
│       ├── 0003_storage.sql    # Buckets + storage policies
│       └── 0004_functions.sql  # Triggers + business logic
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (auth)/             # Login, registro, onboarding
│   │   ├── (main)/             # Rutas principales
│   │   │   ├── catalogo/       # Catálogo con filtros
│   │   │   ├── cursos/[slug]/  # Detalle + player
│   │   │   ├── checkout/       # Stripe checkout
│   │   │   ├── instructor/     # Dashboard instructor
│   │   │   ├── estudiante/     # Dashboard estudiante
│   │   │   ├── perfil/         # Perfil editable
│   │   │   └── certificados/   # Verificación pública
│   │   └── api/                # Route Handlers
│   │       ├── stripe/webhook/ # Webhook Stripe
│   │       └── certificates/   # Descarga PDF
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── courses/            # Editor curriculum, forms
│   │   ├── catalog/            # Filtros, cards, search
│   │   ├── player/             # Video player, sidebar
│   │   ├── dashboard/          # Métricas, charts
│   │   ├── landing/            # Hero, features
│   │   ├── layout/             # Header, footer, sidebar
│   │   └── auth/               # Forms auth
│   ├── lib/
│   │   ├── supabase/           # Clients (browser, server, admin, middleware)
│   │   ├── stripe/             # Stripe client, platform fee calc
│   │   ├── actions/            # Server Actions (mutaciones)
│   │   ├── queries/            # Lecturas para Server Components
│   │   ├── validations/        # Zod schemas
│   │   └── certificates/       # Generación PDF (@react-pdf/renderer)
│   └── types/
│       └── database.ts         # Tipos TypeScript del esquema
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 10. Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_PERCENT=10  # Comisión plataforma (%)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo (Turbopack) |
| `npm run build` | Build producción |
| `npm run start` | Sirve build producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |

---

## 12. Próximos Pasos / Roadmap

- [ ] **Stripe Connect**: Onboarding instructores, payouts automáticos
- [ ] **Panel Admin**: UI completa para moderación, usuarios, transacciones
- [ ] **Notificaciones**: Email (Resend/SendGrid) + In-app
- [ ] **Internacionalización (i18n)**: Soporte multi-idioma
- [ ] **Analytics avanzados**: Funnel conversión, engagement, cohortes
- [ ] **Mobile App**: React Native / Expo compartiendo lógica Supabase
- [ ] **Live Sessions**: WebRTC para clases en vivo
- [ ] **Marketplace**: Búsqueda avanzada, recomendaciones ML

---

*Documento generado a partir del código base y especificaciones de EduPlatform (Sección 6 - AI Agent Engineer)*