# UMINE Headhunting — Plataforma de Reclutamiento con IA

Frontend React + TypeScript + Vite para headhunting automatizado con inteligencia artificial.

## Stack actual

| Capa | Tecnologia |
|------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Inline styles + Design tokens (glassmorphism) |
| State | React Context (ThemeContext, SearchContext) |
| i18n | i18next + react-i18next (ES/EN) |
| AI | Groq (Llama 3.3) para NLP, scoring, generacion |
| Automatizacion | n8n (Apollo + Hunter + cold email) |
| Avatar IA | Tavus (entrevistas en video) |

## Funcionalidades implementadas

- **Busqueda NL**: Describe la busqueda en lenguaje natural, la IA completa todos los campos
- **Prospeccion**: Apollo encuentra candidatos, Hunter obtiene emails verificados
- **Scoring IA**: Evaluacion por 6 competencias con sistema de puntuacion profesional
- **Cold email**: Emails personalizados automaticos a candidatos con score >= umbral
- **Entrevistas Avatar**: Sofia (avatar IA) realiza screening en video via Tavus
- **Pipeline**: Kanban visual con filtros, seleccion masiva, terna automatica
- **Multi-etapa**: Configurador de etapas de entrevistas con competencias por etapa
- **Dark/Light mode**: Toggle con persistencia en localStorage
- **i18n**: Espanol/Ingles completo en todas las paginas y componentes
- **Responsive**: Mobile/Tablet/Desktop via useBreakpoint hook

## Estructura del proyecto

```
src/
  components/
    atoms/        → Button, Badge, GlassCard, Input, ScoreBar, TagInput, Toggle, ComboInput
    molecules/    → CandidateRow, EmpresaSelector, StageConfigurator, StatCard
    organisms/    → Navbar, Notifications
    templates/    → DashboardLayout
  pages/          → Landing, Dashboard, NewSearch, Busquedas, SearchPipeline,
                    CandidateDetail, Interviews, Terna
  contexts/       → ThemeContext, SearchContext
  hooks/          → useBreakpoint, useNotifications
  i18n/
    locales/
      es/         → common, dashboard, landing, search, candidates, interviews
      en/         → (mismos 6 namespaces)
  services/       → n8nService, groqService
  theme/          → tokens (darkTokens, lightTokens, ThemeTokens type)
  types/          → search types
  utils/          → mockData
```

## Setup local

```bash
npm install
npm run dev
```

Variables de entorno (`.env`):
```
VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/xxx
VITE_GROQ_API_KEY=gsk_xxx
```

---

# Proximos pasos

## Fase 1: Containerizacion y CI/CD

### 1.1 Docker
- [ ] Crear `Dockerfile` para el frontend (multi-stage: build + nginx)
- [ ] Crear `docker-compose.yml` con:
  - Frontend (nginx)
  - n8n (main + workers)
  - PostgreSQL (datos de n8n + app)
  - Redis (modo queue de n8n)
- [ ] Crear `Dockerfile.n8n` customizado con nodos necesarios pre-instalados
- [ ] Configurar health checks para todos los servicios

### 1.2 CI/CD
- [ ] GitHub Actions pipeline:
  - Lint + TypeScript check
  - Build + tests
  - Build Docker image
  - Push a ECR
  - Deploy a ECS (staging → produccion)
- [ ] Branch protection rules (main requiere PR + CI green)

## Fase 2: AWS Infrastructure

### 2.1 Arquitectura objetivo

```
CloudFront (CDN)
  └── S3 (Frontend estatico)

ALB (Application Load Balancer)
  ├── ECS Fargate: n8n-main (editor + webhooks)
  ├── ECS Fargate: n8n-workers (x2-5, auto-scaling)
  └── ECS Fargate: API backend (futuro)

RDS PostgreSQL (n8n + app data)
ElastiCache Redis (n8n queue mode)
SES (cold emails)
Secrets Manager (API keys: Groq, Apollo, Hunter, Tavus)
CloudWatch (logs + alertas)
```

### 2.2 Infraestructura como codigo
- [ ] Terraform o AWS CDK para:
  - VPC + subnets (public/private)
  - ECS Cluster + Task Definitions + Services
  - RDS PostgreSQL (Multi-AZ para produccion)
  - ElastiCache Redis
  - ALB + Target Groups + Listener Rules
  - S3 bucket + CloudFront distribution
  - IAM roles + policies
  - Security Groups
  - Secrets Manager
  - CloudWatch log groups + alarms

### 2.3 n8n en modo queue (clave para escalar)
- [ ] Configurar n8n con `EXECUTIONS_MODE=queue`
- [ ] Separar contenedor "main" (UI + webhooks) de "workers" (ejecuciones)
- [ ] Auto-scaling de workers basado en queue depth
- [ ] Configurar `DB_TYPE=postgresdb` apuntando a RDS
- [ ] Redis como queue backend via ElastiCache

### 2.4 Costo estimado
| Recurso | Especificacion | Costo mensual |
|---------|---------------|--------------|
| ECS Fargate (n8n main) | 0.5 vCPU, 1GB RAM | ~$15 |
| ECS Fargate (2 workers) | 0.5 vCPU, 1GB RAM c/u | ~$30 |
| RDS PostgreSQL | db.t3.micro | ~$15 |
| ElastiCache Redis | cache.t3.micro | ~$13 |
| S3 + CloudFront | Frontend | ~$5 |
| ALB | 1 LB | ~$20 |
| SES | 10k emails/mes | ~$1 |
| **Total MVP** | | **~$100-150/mes** |

## Fase 3: Backend API

### 3.1 API propia (reemplazar llamadas directas)
- [ ] API REST o tRPC en Node.js/Express o Hono
- [ ] Endpoints:
  - `POST /searches` — Crear busqueda (orquesta n8n)
  - `GET /searches/:id` — Estado + candidatos
  - `POST /searches/:id/interview` — Iniciar entrevista Tavus
  - `GET /candidates/:id` — Detalle candidato
  - `PATCH /candidates/:id/status` — Cambiar estado
  - `GET /interviews` — Historial
  - `POST /interviews/:id/scorecard` — Guardar scorecard
- [ ] Autenticacion: Clerk o Auth.js (JWT)
- [ ] Middleware: rate limiting, CORS, validation (Zod)
- [ ] Base de datos: Drizzle ORM + PostgreSQL

### 3.2 Migracion de datos
- [ ] Reemplazar `mockData.ts` con llamadas reales a la API
- [ ] Reemplazar `SearchContext` con React Query + API calls
- [ ] Persistir busquedas, candidatos, entrevistas en PostgreSQL

## Fase 4: Integraciones reales

### 4.1 n8n workflows de produccion
- [ ] Workflow: Busqueda Apollo → enriquecimiento Hunter → scoring Claude → cold email SES
- [ ] Workflow: Recepcion CV (email inbound) → parsing → scoring IA
- [ ] Workflow: Trigger entrevista Tavus → webhook resultado → scorecard
- [ ] Error handling + retries en cada workflow
- [ ] Monitoreo de ejecuciones fallidas (Slack/email alerts)

### 4.2 Tavus Avatar
- [ ] Integrar API real de Tavus para entrevistas en video
- [ ] Crear avatar "Sofia" con persona de RRHH
- [ ] Configurar preguntas dinamicas por busqueda
- [ ] Recibir transcripcion + analisis post-entrevista

### 4.3 Email
- [ ] Configurar dominio + DKIM/SPF/DMARC en SES
- [ ] Templates de email responsive (MJML)
- [ ] Tracking de aperturas y clicks
- [ ] Manejo de bounces y complaints

## Fase 5: Features avanzados

### 5.1 Analytics dashboard
- [ ] Metricas: tiempo promedio de contratacion, tasa de conversion por etapa
- [ ] Graficos: candidatos por estado, score distribution, email performance
- [ ] Export a CSV/Excel

### 5.2 Multi-tenancy
- [ ] Organizaciones con multiples usuarios
- [ ] Roles: Admin, Recruiter, Hiring Manager (solo ver terna)
- [ ] Busquedas compartidas dentro de la organizacion

### 5.3 Notificaciones real-time
- [ ] WebSockets o SSE para actualizar pipeline en vivo
- [ ] Notificaciones push cuando llega un CV
- [ ] Email digest diario de actividad

### 5.4 AI improvements
- [ ] Fine-tuning del scoring por industria
- [ ] Analisis de video de entrevistas (sentiment, body language)
- [ ] Prediccion de fit cultural basada en datos historicos
- [ ] Generacion automatica de reportes ejecutivos

## Fase 6: Produccion

### 6.1 Seguridad
- [ ] HTTPS everywhere (ACM certificates)
- [ ] WAF en CloudFront
- [ ] Encriptacion at rest (RDS, S3) y in transit
- [ ] Audit logging
- [ ] GDPR compliance (derecho al olvido, export de datos)

### 6.2 Observabilidad
- [ ] Structured logging (CloudWatch Logs)
- [ ] Metricas custom (CloudWatch Metrics)
- [ ] Alertas: error rate, latencia, n8n queue depth
- [ ] Dashboards operacionales

### 6.3 Performance
- [ ] CDN caching para assets estaticos
- [ ] Database indexing optimization
- [ ] Connection pooling (PgBouncer)
- [ ] Lazy loading de paginas (React.lazy)

---

## Comandos utiles

```bash
# Desarrollo
npm run dev

# Build produccion
npm run build

# Type check
npx tsc --noEmit

# Preview build local
npm run preview
```

## Variables de entorno

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `VITE_N8N_WEBHOOK_URL` | URL del webhook de n8n | Si |
| `VITE_GROQ_API_KEY` | API key de Groq para Llama 3.3 | Si |
| `VITE_TAVUS_API_KEY` | API key de Tavus (avatar) | No (futuro) |
