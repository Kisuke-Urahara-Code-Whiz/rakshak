from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
router = APIRouter()
@router.websocket("/ws/front/{client_id}")
async def websocket_front(websocket: WebSocket, client_id: str):
    manager = websocket.app.state.manager
    await manager.connect("FRONT", client_id, websocket)
    print(f"[WS] Connected: FRONT Client '{client_id}'")
    try:
        while True:
            try:
                raw_data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "PING"})
                continue
            try:
                payload = json.loads(raw_data)
            except (json.JSONDecodeError, TypeError):
                payload = {}
            print(
                f"[FRONT #{client_id}] ACK Status: {payload.get('status')} | "
                f"Device: {payload.get('device_id', 'N/A')}"
            )

    except WebSocketDisconnect as e:
        print(f"[WS] Disconnected cleanly: FRONT Client '{client_id}' (Code: {e.code})")
    except Exception as e:
        print(f"[WS] Exception on FRONT Client '{client_id}': {e}")
    finally:
        manager.disconnect("FRONT", client_id)
        try:
            await websocket.close()
        except Exception:
            pass