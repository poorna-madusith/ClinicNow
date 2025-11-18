# ClinicNow

ClinicNow is a full-stack medical center management platform that streamlines how administrators, doctors, and patients work together. It combines role-aware authentication, smart scheduling, queue-aware booking, payments, analytics, and real-time collaboration into a single experience.

**Live demo**: https://clinicnow.netlify.app

## Screenshots

![ClinicNow Screenshot 1](ss/Screenshot%202025-11-18%20073805.png)

![ClinicNow Screenshot 2](ss/Screenshot%202025-11-18%20073848.png)

![ClinicNow Screenshot 3](ss/Screenshot%202025-11-18%20075047.png)

![ClinicNow Screenshot 4](ss/Screenshot%202025-11-18%20075645.png)

## Architecture at a Glance
- **Backend**: ASP.NET Core 8 Web API with Identity, JWT & Google OAuth, PostgreSQL (managed on Aiven) via Entity Framework Core 9, SignalR hubs, mail delivery, Gemini-powered chatbot, Stripe billing, and PDF receipt generation (iText7).
- **Frontend**: Next.js 15 (App Router) with React 19, Tailwind CSS 4, Radix UI primitives, SignalR JS client, Stripe Elements, and Netlify-ready deployment.
- **Realtime & Messaging**: SignalR hubs for live session status, queue updates, and doctor-patient chat, backed by persistent EF models.
- **DevOps**: Docker Compose for local orchestration, Fly.io/Railway/Netlify configs for cloud deployment, environment-driven settings.

## Feature Highlights
### Patient Experience
- Discover doctors and their upcoming sessions, complete with capacity, fees, and descriptions.
- Reserve a session slot, pay securely with Stripe, and receive PDF receipts.
- Track queue position and live session state through SignalR updates.
- Chat with assigned doctors in real time and review full message history.
- Submit structured feedback and ratings that feed into admin analytics.
- Use passwordless Google sign-in, JWT refresh tokens, and guided password reset emails.

### Doctor Workspace
- Configure recurring or ad-hoc sessions (dates, times, capacity, pricing) and manage edits, cancellations, and state transitions (scheduled, ongoing, completed).
- Monitor booking queues, mark patients as ongoing/completed, and keep patients informed live.
- Receive feedback summaries and booking stats to improve service quality.
- Secure chat rooms with patients for tele-consult follow-ups.

### Admin Console
- Onboard doctors, manage clinic staff, and oversee bookings from a centralized API surface (`AdminDocController`, `SessionController`).
- Access rich analytics: gender/town distributions, specialization mix, weekly bookings, doctor ratings, and sentiment per rating category (`ReportController`).
- Export-ready data via DTO-driven endpoints, suitable for dashboards or BI tools.

### Platform Capabilities
- **Security**: ASP.NET Identity roles (Admin, Doctor, Patient), JWT access tokens + refresh cookies, Google OAuth, encrypted credentials, MailKit-powered reset links.
- **Payments**: Stripe PaymentIntent workflow, webhook reconciliation, booking linking, and downloadable PDF receipts.
- **Realtime UX**: SignalR hubs (`SessionHub`, `ChatHub`) push live queue updates and chat messages to the Next.js client, avoiding manual refreshes.
- **AI Assistant**: Gemini Pro–backed chatbot (`ChatBotController`) that triages questions with guardrails for safe, professional responses.
- **Extensibility**: DTO-rich API surface, modular services layer, and Dockerized deployment make it easy to add modules (e.g., pharmacy, lab orders).

## Tech Stack
| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind 4, Radix UI, Stripe.js, SignalR JS |
| Backend | ASP.NET Core 8, EF Core 9, PostgreSQL, Identity, JWT + Google OAuth, Stripe .NET, SignalR, MailKit, iText7, Gemini SDK |
| Tooling | Docker Compose, Netlify, Fly.io, Railway, ESLint, TypeScript, Swagger/OpenAPI |

## Getting Started
### Prerequisites
- .NET 8 SDK
- Node.js 20+ with npm
- PostgreSQL database (local or managed, e.g., Aiven)
- Stripe, Google OAuth, Gemini, and SMTP credentials
- (Optional) Docker Desktop for containerized runs

### 1. Clone & Install
```bash
cd "d:/Medical Center Management system"
git clone <repo-url> ClinicNow
cd ClinicNow
```

### 2. Configure Environment
Update `backend/appsettings.Development.json` (or user secrets) with the following keys:

| Key | Description |
| --- | --- |
| `ConnectionStrings:DBConnection` | PostgreSQL connection string |
| `Jwt:{Issuer,Audience,Key}` | JWT signing details |
| `Authentication:Google:{ClientId,ClientSecret}` | OAuth 2.0 credentials |
| `Stripe:{SecretKey,WebhookSecret}` | Payment processing keys |
| `Gemini:ApiKey` | Google AI Studio / Vertex Gemini key |
| `FrontendUrl` | Base URL of the Next.js app (used in email links, CORS) |
| `MailSettings:{From,Host,Port,UserName,Password}` | SMTP settings for password resets |

Frontend environment variables (e.g., `.env.local`) should include API URLs, SignalR endpoints, and Stripe publishable keys.

### 3. Database Setup
```bash
dotnet tool install --global dotnet-ef
cd backend
dotnet ef database update
```
This applies the latest migrations from `backend/Migrations` to your PostgreSQL instance.

### 4. Run the Backend
```bash
cd backend
dotnet restore
dotnet run
```
The API defaults to `https://localhost:5001` with Swagger UI enabled.

### 5. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to access the ClinicNow UI.

### 6. Docker (Optional)
```bash
docker compose up --build
```
The root `docker-compose.yml` wires up the backend, frontend, and dependencies for an end-to-end stack.

## Key Workflows
- **Auth**: `AuthController` handles registration, login, Google sign-in, refresh tokens, profile updates, and password recovery.
- **Sessions & Bookings**: `SessionController` (doctors/admin) plus `UserSessionController` (patients) deliver scheduling, booking, cancellations, and queue management.
- **Chat & Presence**: `ChatController` plus `ChatHub` expose REST APIs + SignalR for conversation creation, history retrieval, read receipts, and real-time delivery.
- **Payments**: `PaymentController` manages Stripe intents, webhook verification, booking association, and PDF receipt generation.
- **Insights**: `ReportController` supplies admin dashboards with demographics, specialization mixes, weekly booking trends, and quality metrics.

## Deployment Notes
- **Backend**: `fly.toml`, `railway.json`, and Dockerfile showcase cloud targets; ensure secrets are stored in the provider’s secret store.
- **Frontend**: `netlify.toml` enables one-command deployment to Netlify (Next.js SSR). Adjust env vars per environment.
- **Monitoring**: Leverage Stripe dashboard, Postgres logs, and Application Insights-compatible hooks in ASP.NET for observability.
- **Data Layer**: Production PostgreSQL runs on an Aiven-managed cluster, so provision secrets through Aiven’s console and allowlisted IPs inside `appsettings.*` or the hosting platform.
