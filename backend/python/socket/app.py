from contextlib import asynccontextmanager
from fastapi import FastAPI
from ConMan import ConnectionManager
import frontAlert
from collections import deque
import json

import socketManager

@asynccontextmanager
async def lifespan(app: FastAPI):
    with open('riskTemp.json', 'r') as file:
        data = json.load(file)
    app.state.riskTemp = data
    app.state.manager = ConnectionManager()
    app.state.soil_queue = deque(maxlen=50)
    app.state.real_soil = 350
    app.state.vibration = 0.1
    app.state.smsLimit = 2
    app.state.sms=0
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(socketManager.router)
app.include_router(frontAlert.router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)