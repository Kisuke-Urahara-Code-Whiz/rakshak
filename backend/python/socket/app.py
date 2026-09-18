from contextlib import asynccontextmanager
from fastapi import FastAPI
from ConMan import ConnectionManager
from collections import deque

import socketManager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.manager = ConnectionManager()
    app.state.soil_queue = deque(maxlen=50)
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(socketManager.router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)