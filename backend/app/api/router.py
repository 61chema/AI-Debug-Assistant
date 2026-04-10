from fastapi import APIRouter
from app.api import explainer, debugger, analyzer, github, history

# Main router — all sub-routers are registered here with their prefixes
api_router = APIRouter(prefix="/api")

api_router.include_router(explainer.router, tags=["explain"])
api_router.include_router(debugger.router, tags=["debug"])
api_router.include_router(analyzer.router, tags=["analyze"])
api_router.include_router(github.router, tags=["github"])
api_router.include_router(history.router, tags=["history"])
