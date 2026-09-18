from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
from datetime import datetime

router = APIRouter()

@router.websocket("/ws/front/{client_id}")
async def websocket_front(websocket: WebSocket, client_id: str):
    manager = websocket.app.state.manager
    await manager.connect("FRONT", client_id, websocket)
    print(f"[WS] Connected: FRONT Client '{client_id}'")

    try:
        while True:
            try:
                # 60 second timeout for client heartbeats/messages
                raw_data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
            except asyncio.TimeoutError:
                # Send server ping to keep the connection alive
                try:
                    await websocket.send_json({"type": "PING"})
                except Exception:
                    # Client is unreachable or disconnected
                    break
                continue

            try:
                payload = json.loads(raw_data)
            except (json.JSONDecodeError, TypeError):
                payload = {}

            req_type = payload.get("type")
            '''
            # 1. Handle Initial Query from React Frontend
            if req_type == "INIT_QUERY":
                lat = payload.get("latitude")
                lng = payload.get("longitude")
                lang = payload.get("language")
                print(f"[FRONT #{client_id}] INIT_QUERY -> Lat: {lat}, Lng: {lng}, Lang: {lang}")

                # Send initial telemetry snapshot back immediately
                soil_val = getattr(websocket.app.state, "real_soil", 450)
                vib_val = getattr(websocket.app.state, "vibration", 0.08)
                risk_pct = max(0, min(100, int((500 - soil_val) / 3.5 + (vib_val * 30))))

                await websocket.send_json({
                    "type": "INIT_DATA",
                    "soil_moisture": soil_val,
                    "vibration": vib_val,
                    "risk_percentage": risk_pct,
                    "rainfall_rate": round(soil_val * 0.12, 1),
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
            '''
            # 2. Handle Client PONG Heartbeat Response
            if req_type == "PONG":
                pass

            print(
                f"[FRONT #{client_id}] Action: {req_type} | "
                f"Status: {payload.get('status', 'OK')} | "
                f"Device: {client_id}"
            )

    except WebSocketDisconnect as e:
        print(f"[WS] Disconnected cleanly: FRONT Client '{client_id}' (Code: {e.code})")
    except Exception as e:
        print(f"[WS] Exception on FRONT Client '{client_id}': {e}")
    finally:
        # Cleanup client connection safely without double-closing
        if hasattr(manager, "disconnect"):
            manager.disconnect("FRONT", client_id)
        try:
            await websocket.close()
        except Exception:
            pass  # Already closed