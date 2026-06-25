# CRM local de Dmoov

CRM automatizado y autoalojado para reemplazar gradualmente a Vambe. Maneja los
leads de WhatsApp de las 7 sedes, el embudo de ventas, los Day Pass, los pagos y
los asistentes de IA por sede.

## Stack (deliberadamente simple, para mantener entre pocas personas)

- **TypeScript** de punta a punta — un solo lenguaje.
- **Next.js** — sirve el panel web y el webhook de WhatsApp.
- **PostgreSQL + Prisma** — base de datos con Prisma Studio (interfaz visual para
  navegar los datos sin saber SQL).
- **pg-boss** — timers y automatizaciones sobre el mismo Postgres (sin Redis).
- **Gemini por API** — la IA de los bots, detrás de una interfaz intercambiable
  por un modelo local más adelante.
- **Docker Compose** — todo se levanta con un comando.

## Requisitos

- Docker y Docker Compose
- Node.js 20+ y npm

## Cómo correrlo (estado actual)

```bash
# 1. Variables de entorno
cp .env.example .env

# 2. Levantar la base de datos
docker compose up -d db

# 3. Instalar dependencias
npm install

# 4. Crear las tablas a partir del modelo
npm run db:push

# 5. Cargar datos reales de Dmoov (sedes, planes, precios, etiquetas, bots)
npm run db:seed

# 6. Abrir el navegador de datos
npm run db:studio   # http://localhost:5555
```

Tras el seed deberías ver 7 sedes, sus planes con precios, 10 etapas de embudo,
9 etiquetas, los ejecutivos conocidos y los 13 asistentes.

## Qué hay hoy y qué sigue

Fase 1 — **núcleo de datos** ✅ (esto)
- Modelo completo de Dmoov en `prisma/schema.prisma`
- Datos reales cargados en `prisma/seed.ts`

Fase 2 — **ingesta + panel de solo lectura**
- Webhook que recibe copias de mensajes desde Vambe (migración sin riesgo)
- Panel web: Kanban del embudo, bandeja de chats, buscador

Fase 3 — **orquestador + IA**
- Reemplazo del Enrutador Inicial y los bots por sede (Gabriela) con Gemini
- Funciones: etiquetar, cambiar etapa, registrar Day Pass, generar link de pago

Fase 4 — **gateway propio de WhatsApp**
- Conexión directa a la API de Meta Cloud, migración de números y plantillas

Fase 5 — **automatizaciones y analítica**
- Timer "link enviado y no pagó en 15 min", reactivación, SLA y reportes

## Estructura

```
dmoov-crm/
├─ docker-compose.yml      # PostgreSQL (web/worker se agregan en fases siguientes)
├─ .env.example
├─ package.json
└─ prisma/
   ├─ schema.prisma        # modelo de datos
   └─ seed.ts              # datos reales de Dmoov
```
