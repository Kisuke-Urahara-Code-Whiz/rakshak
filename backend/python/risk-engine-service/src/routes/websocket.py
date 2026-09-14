from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..state import manager

router = APIRouter()


@router.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(device_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[{device_id} ACK]: {data}")
    except WebSocketDisconnect:
        manager.disconnect(device_id)