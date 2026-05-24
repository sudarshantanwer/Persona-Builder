from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api import datasets, personas
from app.services.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Persona Builder ML Service", version="1.0.0", lifespan=lifespan)

app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["datasets"])
app.include_router(personas.router, prefix="/api/v1/personas", tags=["personas"])

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ml-service"}
