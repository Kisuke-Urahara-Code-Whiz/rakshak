from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import os
import time
import json
from datetime import datetime
import random
import requests
import threading

router = APIRouter()
SMS_RATE_LIMIT_SECONDS = 60.0

def _dispatch_sms_fire_and_forget(url: str, timeout: float = 2.0):
    """Dispatches SMS alert in a background daemon thread so the real-time stream is never blocked."""
    if not url:
        return
    try:
        requests.post(url, timeout=timeout)
    except Exception as e:
        print(f"[SMS ASYNC] Non-blocking dispatch notice: {e}")

def tel(realsoil: float, vibration: float,riskPercentage: float):
    # Ensure vibration is float
    if vibration is None:
        vibration = 0.0
    else:
        try:
            vibration = float(vibration)
        except (ValueError, TypeError):
            vibration = 0.0

    risk_pct = riskPercentage
    sms_logs = []

    if risk_pct >= 85 or realsoil < 200:
        timestamp = datetime.now().strftime("%H:%M:%S")
        sms_logs = [
        {
            "id": 1,
            "recipient": "+919830123456",
            "status": "SENT",
            "type": "Registered User",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 2,
            "recipient": "+919874987654",
            "status": "SENT",
            "type": "Unregistered User",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 3,
            "recipient": "+916289645167",
            "status": "SENT",
            "type": "Unregistered User",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 4,
            "recipient": "+918337049905",
            "status": "SENT",
            "type": "Rakshak App User",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 5,
            "recipient": "+917439407308",
            "status": "SENT",
            "type": "Driver",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 6,
            "recipient": "+918159073507",
            "status": "SENT",
            "type": "MDoner Employee",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        },
        {
            "id": 7,
            "recipient": "+916290289863",
            "status": "SENT",
            "type": "Unregistered User",
            "timestamp": timestamp,
            "message": f"CRITICAL: High Landslide Risk ({risk_pct}%) detected!"
        }   
        ]
        
    payload = {
        "type": "TELEMETRY_UPDATE",
        "soil_moisture": realsoil,
        "vibration": vibration,
        "risk_percentage": risk_pct,
        "rainfall_rate": round((480-realsoil) * 0.12, 1),  # directly proportional
        "sms_logs": sms_logs,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    return payload


@router.websocket("/ws/soil/{client_id}")
async def websocket_soil(websocket: WebSocket, client_id: str):
    manager = websocket.app.state.manager
    soil_queue = websocket.app.state.soil_queue
    sms = websocket.app.state.sms
    limit = websocket.app.state.smsLimit
    riskJson = websocket.app.state.riskTemp

    await manager.connect("SOIL", client_id, websocket)
    print(f"[WS] Connected: SOIL Manager '{client_id}'")

    try:
        while True:
            raw_data = await websocket.receive_text()
            print(f"[SOIL #{client_id}] Received: {raw_data}")

            try:
                data_in = json.loads(raw_data)
            except (json.JSONDecodeError, TypeError):
                print(f">[SOIL #{client_id}] Invalid JSON")
                continue

            # Support both "risk" (from Soil.py) and "soil_value"
            soil_value = data_in.get("risk") if "risk" in data_in else data_in.get("soil_value")
            print(f'{type(soil_value),soil_value}\n')
            if soil_value is None:
                print(f"[SOIL #{client_id}] No soil reading key ('risk' or 'soil_value') found")
                continue

            try:
                soil_value = float(soil_value)
            except (ValueError, TypeError):
                print(f"[SOIL #{client_id}] Invalid soil value: {soil_value}")
                continue

            # Safely extract vibration
            vibration_val = data_in.get("vib", 0.0)
            try:
                vibration_val = float(vibration_val) if vibration_val is not None else 0.0
            except (ValueError, TypeError):
                vibration_val = 0.0

            # Store in app state & queue
            websocket.app.state.real_soil = soil_value
            websocket.app.state.vibration = vibration_val
            soil_queue.append(soil_value)

            print(f"[SOIL] Value: {soil_value} | Vibration: {vibration_val}")
            rp = 0.0
            def trunk(val, vib=0.0):
                clamped = min(max(float(val), 100.0), 450.0)
                base = ((450.0 - clamped) / 350.0) * 75.0 + 15.0
                v_boost = float(vib) * 20.0
                return round(min(100.0, max(5.0, base + v_boost)))

            if data_in.get("riskPercentage") is not None:
                try:
                    rp = float(data_in.get("riskPercentage"))
                except (ValueError, TypeError):
                    rp = trunk(soil_value, vibration_val)
            elif data_in.get("risk_percentage") is not None:
                try:
                    rp = float(data_in.get("risk_percentage"))
                except (ValueError, TypeError):
                    rp = trunk(soil_value, vibration_val)
            else:
                rp = trunk(soil_value, vibration_val)

            # Generate Telemetry Update Payload
            telemetry_payload = tel(soil_value, vibration_val, rp)

            # ALERT TRIGGER
            if soil_value < 200:
                alert_message = {
                    "type": "ALERT",
                    "duration_ms": 2000,
                }
                print(f"🚨 [ALERT] Threshold breached! Soil value = {soil_value}")

                # Rate limit: at most 1 SMS alert POST request per 1 minute (60.0s cooldown)
                now = time.time()
                last_sms_time = getattr(websocket.app.state, "last_sms_alert_time", 0.0)
                if now - last_sms_time >= SMS_RATE_LIMIT_SECONDS:
                    websocket.app.state.last_sms_alert_time = now
                    sms_url = os.getenv(
                        "SMS_SERVICE_URL",
                        "https://telesthetic-tridimensionally-margarete.ngrok-free.dev/sms/send-alert"
                    )
                    print(f"🚨 [SMS DISPATCH] 1-minute cooldown elapsed. Triggering SMS alert POST (fire-and-forget)...")
                    threading.Thread(
                        target=_dispatch_sms_fire_and_forget,
                        args=(sms_url, 2.0),
                        daemon=True,
                    ).start()
                else:
                    cooldown_left = round(SMS_RATE_LIMIT_SECONDS - (now - last_sms_time), 1)
                    print(f"⏳ [SMS RATE LIMITED] Cooldown active ({cooldown_left}s remaining). POST suppressed to enforce 1/min limit.")

                if hasattr(manager, "broadcast_to_role"):
                    await manager.broadcast_to_role(json.dumps(alert_message), "ESP")

            # Broadcast TELEMETRY_UPDATE to FRONT clients
            if hasattr(manager, "broadcast_to_role"):
                # Convert dict to JSON string or send dict depending on your manager setup
                try:
                    await manager.broadcast_to_role(json.dumps(telemetry_payload), "FRONT")
                except Exception:
                    await manager.broadcast_to_role(telemetry_payload, "FRONT")

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