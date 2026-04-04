from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
import models  # noqa: F401 — registers all models

from routers import auth, inventory, billing, returns, reports, alerts, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NovaCart API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(returns.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    print("NovaCart API running")

@app.get("/")
def root():
    return {"message": "NovaCart API running", "version": "1.0.0"}
