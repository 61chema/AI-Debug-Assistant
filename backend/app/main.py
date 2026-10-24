from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.api.router import api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup: create database tables."""
    await init_db()
    yield
    # (nothing to clean up on shutdown)


app = FastAPI(
    title="AI Debug Assistant",
    description="An AI-powered tool to explain, debug, and analyze code at your level.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS, allows the React frontend (running on a different port) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-debug-assistant-frontend-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routes
app.include_router(api_router)


@app.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {
        "status": "ok",
        "model": settings.claude_model,
    }
