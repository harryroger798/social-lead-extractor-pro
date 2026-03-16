from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.api.routes import router
from app.api.test_runner import router as test_runner_router
from app.services.log_service import init_logging


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncGenerator[None, None]:
    """Initialize logging and database on startup."""
    init_logging()
    await init_db()
    yield


app = FastAPI(
    title="SnapLeads",
    version="1.0.0",
    lifespan=lifespan,
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)
app.include_router(test_runner_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
