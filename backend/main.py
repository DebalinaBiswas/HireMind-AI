from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.api.v1.routes.resume import router as resume_router
from app.api.v1.routes.question import router as question_router
from app.api.v1.routes.rag import router as rag_router
from app.api.v1.routes.interview import router as interview_router
from app.api.v1.routes.report import router as report_router
from app.api.v1.routes.candidate import router as candidate_router
from app.api.v1.routes.traceability import router as traceability_router

from app.core.config import settings
from app.database.init_db import init_db

from app.core.exceptions import (
    validation_exception_handler,
    generic_exception_handler,
)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="AI-powered Role-based Interview Platform"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# EXCEPTION HANDLERS
# ============================================================

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    Exception,
    generic_exception_handler,
)


# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup():
    init_db()


# ============================================================
# ROUTERS
# ============================================================

app.include_router(question_router)

app.include_router(
    resume_router,
    prefix="/api/v1"
)

app.include_router(rag_router)
app.include_router(interview_router)
app.include_router(report_router)
app.include_router(candidate_router)
app.include_router(traceability_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }