# AI Debug Assistant

An AI-powered web app that explains, debugs, and analyzes code at your level (Junior / Mid / Senior).

Built with React + FastAPI + Claude API.

---

## First-time setup

### 1. Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```
ANTHROPIC_API_KEY=your_key_here
GITHUB_TOKEN=your_github_token_here   # optional
```

### 2. Backend

```bash
cd backend

# Create a virtual environment (only needed once)
python3 -m venv .venv

# Activate it (needed every time you open a new terminal)
source .venv/bin/activate

# Install dependencies (only needed once, or when requirements.txt changes)
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

> Every time you open a new terminal to work on the backend, run `source .venv/bin/activate` first.

### 3. Frontend

Open a second terminal:

```bash
cd frontend

# Install dependencies (only needed once)
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Daily workflow (once everything is installed)

**Terminal 1, backend:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2, frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and you're good to go.

---

## Run with Docker (alternative)

If you have Docker Desktop installed, you can run everything with a single command:

```bash
docker-compose up --build
```

Stop it with `Ctrl+C`, then:
```bash
docker-compose down
```

---

## Project structure

```
AI Debug Assistant/
├── backend/
│   ├── app/
│   │   ├── api/          # One file per feature (explain, debug, analyze, github, history)
│   │   ├── models/       # Database models + Pydantic schemas
│   │   ├── services/     # Claude API, GitHub, file processing
│   │   ├── utils/        # Prompt templates
│   │   ├── config.py     # Settings (reads from .env)
│   │   ├── database.py   # SQLite connection
│   │   └── main.py       # FastAPI app entry point
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # One file per page (Explain, Debug, Analyze, GitHub, History)
│       ├── hooks/        # useStream (handles SSE streaming)
│       ├── store/        # Global state (Zustand)
│       └── types/        # TypeScript type definitions
│
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Features

| Feature | What it does |
|---|---|
| Explain Code | Paste code, get an explanation with line-by-line annotations |
| Debug Helper | Paste error + code, get root cause and fix |
| Analyze File | Upload a .py, .js, .pdf, etc. and get a structured analysis |
| GitHub URL | Paste a GitHub file URL and analyze it directly |
| History | Browse and revisit past conversations |

The **Junior / Mid / Senior** selector in the sidebar changes how Claude explains things.
