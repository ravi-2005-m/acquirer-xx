# AcquirerX — Merchant Acquiring & POS Switch System

A production-grade, microservices-based **payment acquiring platform** built with Spring Boot 3, Spring Cloud, and React 19. AcquirerX covers the full acquiring lifecycle: merchant onboarding → terminal provisioning → transaction authorization → risk assessment → settlement → dispute management.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Services & Ports](#services--ports)
4. [Prerequisites](#prerequisites)
5. [Database Setup](#database-setup)
6. [Running the Project](#running-the-project)
7. [API Gateway & Routing](#api-gateway--routing)
8. [Authentication & RBAC](#authentication--rbac)
9. [Service API Reference](#service-api-reference)
10. [Frontend](#frontend)
11. [Inter-Service Communication](#inter-service-communication)
12. [Resilience & Observability](#resilience--observability)
13. [Project Structure](#project-structure)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              http://localhost:5173                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────┐
│                   API Gateway :9090                      │
│        JWT validation · Rate limiting · CORS            │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬───────────┘
   │      │      │      │      │      │      │
:9099  :9091  :9092  :9093  :9094  :9095  :9096
 Auth  Merch  Term   Txn   Risk  Settle  Ops
   │      │      │      │      │      │      │
   └──────┴──────┴──────┴──────┴──────┴──────┘
                         │
              ┌──────────▼──────────┐
              │  Eureka Server :8761 │
              │  Service Discovery  │
              └─────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   MySQL :3306        │
              │  7 separate schemas │
              └─────────────────────┘
```

All microservices register with Eureka. The API Gateway resolves service locations via Eureka, validates JWT tokens, and forwards `X-Username`, `X-User-Role`, and `X-User-Id` headers to downstream services.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.3.4 |
| Service Discovery | Spring Cloud Netflix Eureka 2023.0.3 |
| API Gateway | Spring Cloud Gateway |
| Inter-Service Calls | Spring Cloud OpenFeign |
| Circuit Breaker | Resilience4j |
| Security | Spring Security + JWT (JJWT) |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL 8.4 |
| Build | Apache Maven |
| Frontend | React 19 + Vite |
| UI | Bootstrap 5.3.3 + Bootstrap Icons |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Charts | Recharts |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

---

## Services & Ports

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| eureka-server | 8761 | — | Service registry & discovery |
| api-gateway | 9090 | — | JWT auth, routing, rate limiting |
| auth-service | 9099 | acquirerx_auth | Users, login, JWT, audit logs |
| merchant-service | 9091 | acquirerx_merchant | Merchants, stores, KYC, pricing |
| terminal-service | 9092 | acquirerx_terminal | POS terminals, health, param profiles |
| transaction-service | 9093 | acquirerx_transaction | Authorization, void, refund, batches |
| risk-service | 9094 | acquirerx_risk | Rules, blacklist, fraud scoring |
| settlement-service | 9095 | acquirerx_settlement | Batches, payouts, adjustments |
| ops-service | 9096 | acquirerx_ops | Disputes, recon, reports, notifications |
| frontend | 5173 | — | React web application (dev) |

---

## Prerequisites

- **Java 21** — [Download](https://adoptium.net/)
- **Apache Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8.4** — [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js 20+** and **npm** — [Download](https://nodejs.org/)
- **Git**

---

## Database Setup

Create all 7 schemas in MySQL before starting services:

```sql
CREATE DATABASE acquirerx_auth       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_merchant   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_terminal   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_transaction CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_risk       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_settlement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE acquirerx_ops        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Default credentials used by all services: **username** `root`, **password** `root`  
> To change them, update `spring.datasource.username` / `spring.datasource.password` in each service's `application.properties`.

Hibernate is configured with `ddl-auto=update` — tables are created automatically on first startup.

---

## Running the Project

Start services **in this exact order** (each service must be up before the next):

### Step 1 — Eureka Server

```bash
cd eureka-server
mvn spring-boot:run
```

Open http://localhost:8761 — wait until the dashboard loads.

### Step 2 — Microservices (any order, all 7)

Open a separate terminal for each:

```bash
cd auth-service        && mvn spring-boot:run
cd merchant-service    && mvn spring-boot:run
cd terminal-service    && mvn spring-boot:run
cd transaction-service && mvn spring-boot:run
cd risk-service        && mvn spring-boot:run
cd settlement-service  && mvn spring-boot:run
cd ops-service         && mvn spring-boot:run
```

Wait until all 7 appear as **UP** in the Eureka dashboard.

### Step 3 — API Gateway

```bash
cd api-gateway
mvn spring-boot:run
```

### Step 4 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Quick build check (all services)

```bash
# From root directory
mvn clean package -DskipTests
```

---

## API Gateway & Routing

All frontend and external requests go through the gateway at `http://localhost:9090`.

| Path Prefix | Routes To | Auth Required |
|-------------|-----------|---------------|
| `/api/v1/auth/login` | auth-service | No |
| `/api/v1/auth/register` | auth-service | No |
| `/api/v1/auth/**` | auth-service | Yes |
| `/api/v1/merchants/**` | merchant-service | Yes |
| `/api/v1/stores/**` | merchant-service | Yes |
| `/api/v1/terminals/**` | terminal-service | Yes |
| `/api/v1/transactions/**` | transaction-service | Yes |
| `/api/v1/risk/**` | risk-service | Yes |
| `/api/v1/settlement/**` | settlement-service | Yes |
| `/api/v1/disputes/**` | ops-service | Yes |
| `/api/v1/recon/**` | ops-service | Yes |
| `/api/v1/reports/**` | ops-service | Yes |
| `/api/v1/notifications/**` | ops-service | Yes |

### Rate Limiting

| Tier | Limit | Applied To |
|------|-------|-----------|
| strict | 5 req/min | `/auth/login`, `/auth/register` |
| standard | 60 req/min | Most read endpoints |
| generous | 300 req/min | Transaction processing |
| lenient | 120 req/min | Reports, search |

---

## Authentication & RBAC

### Login

```http
POST http://localhost:9090/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response includes a `token` field. Pass it as a Bearer token in all subsequent requests:

```
Authorization: Bearer <token>
```

### Roles

| Role | Access |
|------|--------|
| `ADMIN` | Full access to all services |
| `MERCHANT_OPS` | Merchants, stores, KYC, pricing, reports |
| `POS_OPS` | Terminals, provisioning |
| `RISK` | Risk rules, blacklist, events |
| `RECON` | Settlement, reconciliation, adjustments, reports |
| `DISPUTES` | Dispute cases, documents, actions |

### Register a new user (Admin only)

```http
POST http://localhost:9090/api/v1/auth/register
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "username": "jane",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "secret123",
  "role": "MERCHANT_OPS"
}
```

---

## Service API Reference

All services expose Swagger UI at:  
`http://localhost:<port>/api/v1/swagger-ui.html`

### Auth Service `:9099`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/register` | Create user (ADMIN) |
| GET | `/auth/validate` | Validate token |
| GET | `/auth/users` | List all users (ADMIN) |
| GET | `/auth/users/{id}` | Get user by ID |
| PATCH | `/auth/users/{id}/role` | Change user role (ADMIN) |
| PATCH | `/auth/users/{id}/deactivate` | Deactivate user (ADMIN) |
| PATCH | `/auth/users/{id}/reactivate` | Reactivate user (ADMIN) |
| GET | `/auth/audit` | Audit log (ADMIN) |

### Merchant Service `:9091`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/merchants` | Create merchant |
| GET | `/merchants` | List all merchants (paginated) |
| GET | `/merchants/{id}` | Get merchant by ID |
| PUT | `/merchants/{id}` | Update merchant |
| PATCH | `/merchants/{id}/status` | Change status |
| GET | `/merchants/stats` | Dashboard stats |
| POST | `/merchants/search` | Filter merchants |
| GET | `/merchants/{id}/stores` | List stores for merchant |
| POST | `/stores` | Create store |
| GET | `/stores/{id}` | Get store |
| PUT | `/stores/{id}` | Update store |
| POST | `/merchants/{id}/kyc` | Submit KYC document |
| GET | `/merchants/{id}/kyc` | List KYC docs |
| PATCH | `/kyc/{kycId}/verify` | Verify KYC (ADMIN) |
| PATCH | `/kyc/{kycId}/reject` | Reject KYC (ADMIN) |
| POST | `/merchants/{id}/settlement-profile` | Create settlement profile |
| POST | `/merchants/{id}/pricing` | Create pricing model |

### Terminal Service `:9092`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/stores/{storeId}/terminals` | Provision terminal |
| GET | `/stores/{storeId}/terminals` | List terminals in store |
| GET | `/terminals/{id}` | Get terminal |
| PUT | `/terminals/{id}` | Update terminal |
| PATCH | `/terminals/{id}/status` | Enable/disable terminal |
| GET | `/terminals/stats` | Terminal stats |
| POST | `/terminals/search` | Filter terminals |
| POST | `/param-profiles` | Create param profile |
| GET | `/param-profiles` | List param profiles |

### Transaction Service `:9093`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/transactions/authorize` | Authorize a payment |
| POST | `/transactions/void` | Void an authorized transaction |
| POST | `/transactions/refund` | Refund a settled transaction |
| GET | `/transactions/{authId}` | Get transaction by ID |
| POST | `/transactions/search` | Filter transactions |
| GET | `/transactions/stats` | Transaction stats |
| POST | `/transactions/batch/{terminalId}/open` | Open EOD batch |
| POST | `/transactions/batch/{terminalId}/close` | Close EOD batch |
| GET | `/transactions/batch/{terminalId}` | Current batch status |

**Authorize request example:**
```json
{
  "terminalId": 1,
  "merchantId": 1,
  "pan": "4111111111111111",
  "amount": 1500.00,
  "currency": "INR",
  "idempotencyKey": "unique-key-123"
}
```

### Risk Service `:9094`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/risk/rules` | Create risk rule |
| GET | `/risk/rules` | List all rules |
| PATCH | `/risk/rules/{id}/deactivate` | Deactivate rule |
| POST | `/risk/blacklist` | Add to blacklist |
| GET | `/risk/blacklist` | List blacklist entries |
| DELETE | `/risk/blacklist/{id}` | Remove from blacklist |
| POST | `/risk/check` | Manual risk evaluation |
| GET | `/risk/events` | Risk event log |
| GET | `/risk/summary` | Risk dashboard stats |

**Risk decision response:**
```json
{
  "result": "ALLOW",
  "score": 15,
  "reason": "All rules passed"
}
```
Results: `ALLOW`, `REVIEW`, or `BLOCK`

### Settlement Service `:9095`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/settlement/merchant/{merchantId}` | Run settlement for merchant |
| GET | `/settlement/merchant/{merchantId}` | Settlement history |
| POST | `/settlement/payout/{settleBatchId}` | Generate payout |
| GET | `/settlement/{batchId}/payouts` | List payouts for batch |
| POST | `/settlement/adjustments` | Create adjustment |
| GET | `/settlement/adjustments/merchant/{merchantId}` | List adjustments |
| GET | `/settlement/summary/merchant/{merchantId}` | Settlement summary |
| GET | `/settlement/stats` | Global settlement stats |
| POST | `/settlement/search` | Filter settlement batches |

### Ops Service `:9096`

**Disputes**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/disputes` | Open a dispute |
| GET | `/disputes` | List all disputes (paginated) |
| GET | `/disputes/{id}` | Get dispute by ID |
| GET | `/disputes/open` | List open disputes |
| GET | `/disputes/stage/{stage}` | Filter by stage |
| PATCH | `/disputes/{id}/advance` | Advance stage |
| PATCH | `/disputes/{id}/close` | Close dispute |
| POST | `/disputes/documents` | Attach document |
| GET | `/disputes/{id}/documents` | List documents |
| POST | `/disputes/actions` | Add action/note |
| GET | `/disputes/{id}/actions` | List actions |
| GET | `/disputes/stats` | Dispute dashboard stats |
| POST | `/disputes/search` | Filter disputes |

Dispute stages (in order): `RETRIEVAL → CHARGEBACK → REPRESENTMENT → ARBITRATION`

**Reconciliation & Reports**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/recon` | List recon files |
| POST | `/recon/upload` | Upload recon file |
| GET | `/reports` | List acquirer reports |
| POST | `/reports/generate` | Generate report |
| GET | `/notifications` | List notifications |

---

## Frontend

The React frontend is a single-page application at http://localhost:5173.

### Pages & Modules

| Module | Route | Description |
|--------|-------|-------------|
| Login | `/login` | JWT login |
| Dashboard | `/dashboard` | Stats overview across all services |
| Merchants | `/merchants` | Merchant list, create, edit |
| Merchant Detail | `/merchants/:id` | Tabs: Info · Stores · KYC · Settlement · Pricing |
| Terminals | `/terminals` | Terminal list, search, health |
| Transactions | `/transactions` | Transaction list, authorize, void, refund |
| Risk | `/risk` | Rules, blacklist, event log |
| Settlement | `/settlement` | Batches, payouts, adjustments |
| Disputes | `/disputes` | Case list, detail, documents, actions |
| Users | `/users` | User management (ADMIN) |

### Environment Configuration

Create or edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:9090/api/v1
VITE_APP_NAME=AcquirerX
```

### Frontend Commands

```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Start dev server on :5173
npm run build      # Production build → dist/
npm run preview    # Preview production build on :4173
```

---

## Inter-Service Communication

Services communicate synchronously via **OpenFeign** clients with Eureka-based load balancing.

| Caller | Calls | Purpose |
|--------|-------|---------|
| transaction-service | risk-service | Score every authorization |
| transaction-service | merchant-service | Validate merchant/terminal |
| settlement-service | transaction-service | Fetch transactions for settlement |
| ops-service | transaction-service | Fetch transaction details for disputes |

Auth headers (`X-Username`, `X-User-Role`, `X-User-Id`) are automatically forwarded by `FeignAuthInterceptor` so downstream services can enforce RBAC.

**Circuit Breaker** (Resilience4j) wraps every Feign call:
- 50% failure rate → circuit opens for 30 s
- 3 test calls in half-open state before recovery
- Fallback on risk-service: transaction is **BLOCKED** (fail-closed)

---

## Resilience & Observability

### Health Checks

Every service exposes Spring Boot Actuator:

```
GET http://localhost:<port>/api/v1/actuator/health
GET http://localhost:<port>/api/v1/actuator/metrics
GET http://localhost:<port>/api/v1/actuator/circuitbreakers
```

### Swagger UI

Each service's interactive API docs:

| Service | URL |
|---------|-----|
| auth-service | http://localhost:9099/api/v1/swagger-ui.html |
| merchant-service | http://localhost:9091/api/v1/swagger-ui.html |
| terminal-service | http://localhost:9092/api/v1/swagger-ui.html |
| transaction-service | http://localhost:9093/api/v1/swagger-ui.html |
| risk-service | http://localhost:9094/api/v1/swagger-ui.html |
| settlement-service | http://localhost:9095/api/v1/swagger-ui.html |
| ops-service | http://localhost:9096/api/v1/swagger-ui.html |

### Eureka Dashboard

http://localhost:8761 — all 7 microservices should appear as **UP**.

---

## Project Structure

```
ax/
├── eureka-server/          # Service discovery
├── api-gateway/            # JWT gateway, routing, rate limiting
├── auth-service/           # Users, JWT, audit logs
├── merchant-service/       # Merchants, stores, KYC, pricing
├── terminal-service/       # POS terminals, param profiles
├── transaction-service/    # Core switch — auth, void, refund, batches
├── risk-service/           # Fraud rules, blacklist, scoring
├── settlement-service/     # EOD settlement, payouts, adjustments
├── ops-service/            # Disputes, recon, reports, notifications
├── frontend/               # React 19 + Vite SPA
│   ├── src/
│   │   ├── pages/          # One folder per module
│   │   ├── components/     # Shared modals, layout, nav
│   │   ├── services/       # Axios API layer
│   │   └── context/        # AuthContext (JWT state)
│   └── .env                # VITE_API_BASE_URL
├── docs/                   # PDF guides and testing playbook
└── pom.xml                 # Parent POM (Java 21, Spring Boot 3.3.4)
```

Each microservice follows the same internal layout:

```
<service>/src/main/java/com/acquirerx/<domain>/
├── config/
│   ├── security/           # HeaderAuthFilter, SecurityConfig
│   └── FeignAuthInterceptor.java
├── <module>/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
└── common/
    ├── exception/          # GlobalExceptionHandler
    └── pagination/         # PaginationParams, PagedResponseDTO
```

---

## Documentation

Full documentation is available in the `docs/` folder:

- `PROJECT_FLOW_GUIDE.md` — End-to-end flow walkthrough for all modules
- `TESTING_PLAYBOOK.pdf` — Manual testing scenarios and expected results
- Service-specific PDFs for each microservice

---

*AcquirerX — Built with Spring Boot 3 · Spring Cloud · React 19*
