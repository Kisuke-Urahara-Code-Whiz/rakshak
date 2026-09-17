from fastapi import APIRouter, WebSocket,WebSocketDisconnect
import json
router = APIRouter()


@router.websocket("/ws/soil/{client_id}")
async def websocket_soil(websocket: WebSocket, client_id: str):
    manager = websocket.app.state.manager
    soil_queue = websocket.app.state.soil_queue
    await manager.connect("SOIL", client_id, websocket)
    print(f"[WS] Connected: SOIL Manager '{client_id}'")

    try:
        while True:
            raw_data = await websocket.receive_text()
            print(f"[SOIL #{client_id}] Received: {raw_data}")

            try:
                payload = json.loads(raw_data)
            except (json.JSONDecodeError, TypeError):
                print(f"[SOIL #{client_id}] Invalid JSON")
                continue

            # Support both "risk" (from Soil.py) and "soil_value"
            soil_value = payload.get("risk") if "risk" in payload else payload.get("soil_value")

            if soil_value is None:
                print(f"[SOIL #{client_id}] No soil reading key ('risk' or 'soil_value') found")
                continue

            try:
                soil_value = float(soil_value)
            except (ValueError, TypeError):
                print(f"[SOIL #{client_id}] Invalid soil value: {soil_value}")
                continue

            soil_queue.append(soil_value)
            print(f"[SOIL] Value: {soil_value} | Queue size: {len(soil_queue)}/50")

            # ALERT TRIGGER
            if soil_value < 200:
                alert_message = {
                    "type": "ALERT",
                    "duration_ms": 2000,
                }
                print(f"🚨 [ALERT] Threshold breached! Soil value = {soil_value}")
                await manager.broadcast_to_role(json.dumps(alert_message), "ESP")

    except WebSocketDisconnect:
        print(f"[WS] Disconnected: SOIL Manager '{client_id}'")
    except Exception as e:
        print(f"[WS] Error on SOIL Manager '{client_id}': {e}")
    finally:
        manager.disconnect("SOIL", client_id)


@router.websocket("/ws/esp/{client_id}")
async def websocket_esp(websocket: WebSocket, client_id: str):
    manager = websocket.app.state.manager
    await manager.connect("ESP", client_id, websocket)
    print(f"[WS] Connected: ESP Client '{client_id}'")

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                payload = json.loads(raw_data)
            except (json.JSONDecodeError, TypeError):
                payload = {}

            print(
                f"[ESP #{client_id}] ACK Status: {payload.get('status')} | "
                f"Device: {payload.get('device_id', 'N/A')}"
            )

    except WebSocketDisconnect as e:
        print(f"[WS] Disconnected: ESP Client '{client_id}' (Code: {e.code})")
    except Exception as e:
        print(f"[WS] Error on ESP Client '{client_id}': {e}")
    finally:
        manager.disconnect("ESP", client_id)