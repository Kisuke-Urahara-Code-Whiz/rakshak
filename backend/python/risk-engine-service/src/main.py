from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .eureka import init_eureka, stop_eureka
from .routes import alerts, soil, telemetry, websocket
from contextlib import asynccontextmanager
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_eureka()
    yield
    await stop_eureka()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(soil.router)
app.include_router(telemetry.router)
app.include_router(websocket.router)
app.include_router(alerts.router)

@app.get("/health", status_code=200)
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.SERVER_PORT, reload=True)

