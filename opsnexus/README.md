# OpsNexus

**OpsNexus v0.1.0 — CloudOps AI Operations Assistant — Demo Mode**

> ⚠ The Docker backend must be running before opening the desktop app.
> Start it first: `cd opsnexus && docker compose up --build`

---

## What is OpsNexus?

OpsNexus is an internal AI-powered CloudOps operations assistant built for engineering and platform teams. It runs as a desktop application connected to a Python backend API.

Engineers describe a problem in plain language — a Jenkins failure, a Snowflake permission issue, a Kubernetes pod crash — and OpsNexus routes the request to the appropriate diagnostic module and returns a structured, actionable response.

**Everything in v0.1.0 is mock/demo only.** No real systems are connected. No commands are executed. Human approval is required before any action output is shown.

---

## Why It Was Built

Cloud operations teams spend significant time on repetitive troubleshooting, inconsistent runbook usage, and slow incident documentation. OpsNexus was designed to:

- Reduce repetitive manual investigation steps
- Standardize troubleshooting across the team
- Guide newer engineers through approved runbook procedures
- Improve documentation quality through structured outputs
- Speed up incident response with pre-built report templates
- Enforce approval gates before any production action

---

## Architecture

```
Desktop App (Electron + React)
          |
          | HTTP API calls
          v
Backend API (Python + FastAPI)
          |
     +----+----+
     |         |
  Router    Memory
     |
  Planner
     |
  Action Handlers (Jenkins, Snowflake, ADF, K8s, Tableau, Terraform, Incident)
     |
  Mock Integrations (read-only, demo data only)
```

The desktop and backend are fully independent. The desktop connects to the backend via `BACKEND_URL`. The backend runs inside Docker.

---

## Project Structure

```
opsnexus/
  desktop/                    Electron + React + TypeScript UI
    src/
      main.ts                 Electron main process
      preload.ts              Context bridge
      renderer/
        App.tsx               Root app, routing
        api.ts                Backend API client
        components/           TitleBar, Sidebar, StatusBar, Logo
        pages/                Dashboard, Assistant, Actions, Files, Runbooks, Memory, Activity, Settings
        styles/globals.css    Design system, tokens, utilities
    package.json
    vite.config.ts
    tsconfig.json

  backend/                    Python FastAPI backend
    app/
      main.py                 FastAPI app, CORS, health endpoint
      api.py                  All API route handlers
      config.py               Pydantic settings from .env
    core/
      assistant.py            Chat handler
      router.py               Keyword-based tool routing
      planner.py              Delegates to action handlers
      memory.py               Read/write context_store.json
      security.py             Masking, audit logging, RBAC placeholder
    actions/
      jenkins.py              Jenkins build failure analysis
      snowflake.py            Snowflake permission analysis
      adf.py                  ADF pipeline diagnostics
      kubernetes.py           Kubernetes pod diagnostics
      tableau.py              Tableau deployment validation
      terraform.py            Terraform plan review
      incident.py             Incident report generation
    integrations/
      base.py                 Base adapter interface
      mock_jenkins.py         Mock Jenkins data
      mock_snowflake.py       Mock Snowflake data
      mock_azure.py           Mock Azure/ADF data
      mock_kubernetes.py      Mock Kubernetes data
    tools/
      file_analyzer.py        File upload analysis
      log_parser.py           Log error extraction
      command_builder.py      Safe read-only command builder
      runbook_loader.py       Runbook template loader
    memory/
      context_store.json      Persistent context store
    tests/
      test_health.py          Backend unit and integration tests
    requirements.txt
    Dockerfile

  assets/
    logo.svg                  OpsNexus logo (SVG)

  docker-compose.yml
  .env.example
  .gitignore
  README.md
```

---

## Running the Backend with Docker

### Prerequisites
- Docker and Docker Compose installed

### Start the backend

```bash
cd opsnexus
docker compose up --build
```

Backend will be available at: `http://localhost:8000`

### Test it
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok", "version": "0.1.0", "mode": "demo"}
```

---

## Running the Desktop App

### Prerequisites
- Node.js 18+
- Docker (backend must be running first)

### Step 1 — Start the backend
```bash
cd opsnexus
docker compose up --build
```

### Step 2 — Start the desktop app
```bash
cd opsnexus/desktop
npm install
npm run dev
```

This launches **both** the Vite renderer dev server and the Electron desktop window simultaneously.
The Electron window connects to the Vite dev server at `http://localhost:5173` and to the FastAPI backend at `http://localhost:8000`.

---

## Packaging as a Windows Desktop App (.exe Installer)

### Prerequisites
- Node.js 18+
- Windows (cross-compile from macOS/Linux is not supported for NSIS installer)

### Build and package

```bash
cd opsnexus/desktop
npm install
npm run dist
```

This runs:
1. `vite build` — builds the renderer to `dist/`
2. `tsc -p tsconfig.electron.json` — compiles `main.ts` and `preload.ts` to `dist-electron/`
3. `electron-builder` — packages everything into `release/`

### Output files

| File | Description |
|------|-------------|
| `release/OpsNexus Desktop Setup 0.1.0.exe` | NSIS Windows installer |
| `release/win-unpacked/` | Unpacked Windows app folder (portable) |

### App details
- **Product name:** OpsNexus Desktop
- **Version:** 0.1.0
- **Icon:** `build/icon.png`
- **Install directory:** User-selectable (defaults to Program Files)
- **Desktop shortcut:** Created automatically

### Important
> The packaged `.exe` app still requires the Docker backend to be running on the same machine.
> Start the backend first: `docker compose up --build`
> Backend URL: `http://localhost:8000`

---

## Docker Hub Instructions

```bash
# Log in to Docker Hub
docker login

# Build the backend image
docker build -t YOUR_DOCKERHUB_USERNAME/opsnexus-backend:latest ./backend

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/opsnexus-backend:latest

# Run from Docker Hub image
docker run -p 8000:8000 YOUR_DOCKERHUB_USERNAME/opsnexus-backend:latest
```

---

## API Endpoints

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | /health                      | Health check                         |
| GET    | /api/status                  | Full status with config flags        |
| POST   | /api/chat                    | Main assistant chat                  |
| POST   | /api/file/analyze            | File upload analysis                 |
| POST   | /api/actions/jenkins         | Jenkins troubleshooting              |
| POST   | /api/actions/snowflake       | Snowflake permission analysis        |
| POST   | /api/actions/adf             | ADF pipeline diagnostics             |
| POST   | /api/actions/kubernetes      | Kubernetes pod diagnostics           |
| POST   | /api/actions/tableau         | Tableau deployment validation        |
| POST   | /api/actions/terraform       | Terraform plan review                |
| POST   | /api/actions/incident        | Incident report generation           |
| GET    | /api/memory                  | Read context store                   |
| POST   | /api/memory/update           | Update context store                 |
| GET    | /api/activity                | Activity/audit log                   |

---

## What is Demo/Mock Only

Everything in v0.1.0 is demonstration only:

- No real Jenkins, Azure, Snowflake, Tableau, Kubernetes, or Terraform connections
- All response data is generated from mock adapters in `backend/integrations/`
- No commands are executed on any system
- File analysis is pattern-based, not a real scanner
- Memory is stored locally in `context_store.json`
- Audit log is stored locally in `activity_log.json`

---

## How to Add a New Action Module

1. Create `backend/actions/my_tool.py` with a `handle_my_tool(message, environment)` function
2. Create `backend/integrations/mock_my_tool.py` with a mock adapter class
3. Add keyword mappings in `backend/core/router.py`
4. Register the handler in `backend/core/planner.py`
5. Add the API endpoint in `backend/app/api.py`
6. Add the tool card in the desktop `ActionsPage.tsx`

---

## Future Integration Plan

When the team is ready to connect real systems, replace mock adapters in `backend/integrations/` with real implementations:

- `real_jenkins.py` → Jenkins REST API
- `real_azure.py` → Azure SDK (ADF, Monitor, Log Analytics)
- `real_snowflake.py` → Snowflake Python connector
- `real_tableau.py` → Tableau Server Client (TSC)
- `real_kubernetes.py` → Kubernetes Python client
- `real_terraform.py` → Terraform plan output parser

Each integration should be gated by `ENABLE_REAL_INTEGRATIONS=true` in `.env`.

---

## Security Notes

- Read-only mode by default — no write or execute operations
- No production action without explicit human approval in the UI
- RBAC placeholder in `core/security.py` — connect to Azure AD/SSO before production use
- All secrets must be provided via environment variables or Key Vault — never hardcoded
- Sensitive data masking is applied to all audit log entries
- Audit logging is mandatory — records every interaction with tool, user, environment, and status

---

## Manager Summary

OpsNexus is an internal tool being built to improve how our cloud operations team handles troubleshooting and incident response. It is currently in demo mode — nothing real is connected and no systems can be modified.

When an engineer describes a problem, OpsNexus routes it to the right diagnostic workflow and returns a structured response with probable causes, commands to run, and next steps. All responses require human approval before being shown.

The goal is to reduce time spent on repetitive troubleshooting, improve consistency across the team, and make sure every production action goes through an approval gate. Real integrations will only be enabled after a security review and approval from leadership.

---

## Before Production Use

- [ ] Connect company-approved authentication (Azure AD / SSO)
- [ ] Enable RBAC with role-based action permissions
- [ ] Enable real audit logging to Log Analytics
- [ ] Configure secret management (Key Vault)
- [ ] Validate read-only permissions on all integration accounts
- [ ] Security review with IT/InfoSec leadership
- [ ] Confirm approval workflow meets change management policy
- [ ] Test all integrations in dev environment first
- [ ] Document rollback process for each integration
