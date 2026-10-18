# TalentFlow Mini ATS (Applicant Tracking System)

A full-stack, production-grade Mini Applicant Tracking System (ATS) built with **Django REST Framework + React + SQLite**. 

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React.js Frontend                    │
│   • Dashboard & Analytics   • Interactive Kanban Board │
│   • Candidate Directory     • Job Openings Management  │
│   • ATS Match Scoring       • Recruiter Portal Login   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / CORS)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Django REST Framework (Backend)            │
│   • ModelViewSets (Candidates, Jobs, StageHistory)     │
│   • Custom Actions (/update-stage/, /add-note/)        │
│   • Dashboard Analytics Aggregation View               │
│   • Atomic Database Transactions & Validation          │
└───────────────────────────┬────────────────────────────┘
                            │ ORM / SQL Queries
                            ▼
┌────────────────────────────────────────────────────────┐
│             SQLite Relational Database                 │
│   • Candidate  • Job  • StageHistory  • CandidateNote │
└────────────────────────────────────────────────────────┘
```

---

## 2. Real-World Engineering Bottlenecks & Solutions

| Bottleneck / Risk | Real-World Impact | Architectural Approach & Solution |
| :--- | :--- | :--- |
| **N+1 Query Overhead** | Serializing nested candidate profiles (job, stage histories, interviewer notes) can trigger hundreds of SQL queries per page request. | Implemented `select_related('job')` and `prefetch_related('stage_history', 'timeline_notes')` in `CandidateViewSet` to batch-fetch foreign relations in 2 optimized queries. |
| **Stage Transition Race Conditions** | Two recruiters concurrently moving a candidate to conflicting stages can cause state corruption or duplicate stage logs. | Wrapped stage updates in `transaction.atomic()` with explicit previous-stage validation before recording the audit history. |
| **High Search & Filter Latency** | Full-table scans across large pools of applicants degrade performance. | Added database indexes on `email`, `current_stage`, and `created_at`. Configured DRF `SearchFilter` with multi-field indexing. |
| **Audit Trail Tampering** | Audit log integrity must be immutable for compliance (EEOC / hiring audits). | `StageHistory` is managed via a dedicated append-only ledger (`ReadOnlyModelViewSet`), strictly created during system stage events. |
| **Unchecked Resume Payload / Storage** | Direct file uploads on application servers can exhaust disk space and fail on horizontal scaling. | Stored external URL references (`resume_url`), ready for direct pre-signed S3/Cloud Storage upload architecture. |

---

## 3. Directory Structure

```
assignment/
├── backend/                  # Clean backend directory
│   ├── ats_backend/          # Django core project & settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── ats_core/             # ATS Application logic
│   │   ├── models.py         # Job, Candidate, StageHistory, CandidateNote
│   │   ├── serializers.py    # DRF Serializers with stage automation
│   │   ├── views.py          # ViewSets, Analytics, Auth endpoints
│   │   ├── urls.py           # App route registrations
│   │   └── management/       # Seed data management command
│   ├── db.sqlite3            # SQLite database with seeded records
│   ├── manage.py             # Django CLI runner
│   ├── server.py             # Direct server runner
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Clean React Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header & Recruiter status
│   │   │   ├── DashboardView.jsx        # Funnel & KPI analytics
│   │   │   ├── PipelineKanbanView.jsx   # Interactive 6-stage Kanban board
│   │   │   ├── CandidatesTableView.jsx  # Directory with ATS scores & search
│   │   │   ├── CandidateDetailModal.jsx # Profile, timeline audit & notes
│   │   │   ├── CandidateFormModal.jsx   # Add / Edit candidate dialog
│   │   │   ├── StageTransitionModal.jsx # Explicit stage mover
│   │   │   ├── JobsView.jsx             # Job listings management
│   │   │   ├── JobFormModal.jsx         # New job requisition modal
│   │   │   └── LoginModal.jsx           # Recruiter portal login with demo credentials
│   │   ├── api.js            # Axios/Fetch API client
│   │   ├── App.jsx           # Main application state orchestrator
│   │   └── index.css         # Complete modern design system
│   └── package.json
└── README.md
```

---

## 4. How to Run Locally

### 1. Run Backend Server
```bash
# Navigate to backend folder
cd backend

# Run with python manage.py:
python manage.py runserver 127.0.0.1:8000

# Or run with python server.py:
python server.py
```
> The API will be available at: **http://127.0.0.1:8000/api/**

### 2. Run Frontend Server
```bash
# Navigate to frontend folder in a new terminal
cd frontend

# Start Vite dev server:
npm run dev
```
> The web application will be accessible at: **http://127.0.0.1:5173/**

---

## 5. Seed Test Data

To repopulate or refresh the sample dataset with 10 candidates, 5 jobs, and stage audit histories:
```bash
cd backend
python manage.py seed_data
```

---

## 6. Core REST API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/candidates/` | `GET`, `POST` | List candidates (with search, filter, pagination) / Create candidate |
| `/api/candidates/{id}/` | `GET`, `PATCH`, `DELETE` | Retrieve candidate with timeline / Update details / Delete |
| `/api/candidates/{id}/update-stage/` | `POST` | Atomically advance stage, log audit entry, and record reason |
| `/api/candidates/{id}/add-note/` | `POST` | Add recruiter / interviewer assessment note |
| `/api/jobs/` | `GET`, `POST` | List active job requisitions / Post new job opening |
| `/api/analytics/dashboard/` | `GET` | Aggregated funnel metrics, conversion rates, and recent activity logs |
| `/api/auth/login/` | `POST` | Authenticate recruiter (Supports instant demo login) |

---

## 7. Demo Credentials

- **Lead Recruiter (Admin):** Username: `admin` | Password: `password123`
- **Technical Recruiter:** Username: `recruiter` | Password: `password123`
*(Or click the one-click instant demo login buttons inside the Login dialog).*
