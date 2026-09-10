from fastapi import WebSocket
from pydantic import BaseModel
import json

class AlertManager:
    def __init__(self):
        self.listeners: dict[str, WebSocket] = {}

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.listeners[device_id] = websocket
        print(f"Listener node operational: {device_id}")

    def disconnect(self, device_id: str):
        if device_id in self.listeners:
            del self.listeners[device_id]
            print(f"Listener node disconnected: {device_id}")

    async def send_alert(self, device_id: str, duration_ms: int):
        if device_id in self.listeners:
            payload = json.dumps({"type": "ALERT", "duration_ms": duration_ms})
            await self.listeners[device_id].send_text(payload)
            return True
        return False

    async def broadcast_alert(self, duration_ms: int):
        payload = json.dumps({"type": "ALERT", "duration_ms": duration_ms})
        for ws in self.listeners.values():
            await ws.send_text(payload)
        return len(self.listeners)

class AlertRequest(BaseModel):
    device_id: str | None = None  # None triggers ALL connected nodes
    duration_ms: int = 2000