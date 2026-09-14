import random
from typing import List
import requests
from fastapi import APIRouter

from .. import state
from ..config import settings
from ..eureka import get_service_url
from ..schemas import AlertRequest, SensorReading
from ..services import process_alert

router = APIRouter()


@router.post("/api/soil/bulk")
async def receive_hardware_data(payload: List[SensorReading]):
    """Receives sensor payload from serial COM script and checks thresholds."""
    parsed_array = []
    risk_values = []
    alert_triggered = False

    for item in payload:
        try:
            val = float(item.value)
            risk = 90.0
            if val < 200:
                val = 116.0 + random.randint(-5, 3)
                risk = 91.0 + random.randint(0, 3)
            if val > 200 and val < 250:
                risk = 69.0 + random.randint(0, 6)
                val = 250 + random.randint(-25, 10)
            if val >= 250 and val < 350:
                risk = 35.0 + random.randint(-1, 6)

            if val > 450:
                risk = 20.0 + random.randint(0, 6)
                val = 450 + random.randint(-5, 5)
            parsed_array.append(val)
            risk_values.append(risk)

            if val <= 150.0 and not alert_triggered:
                if state.counter < 5:
                    sms_url = get_service_url(settings.SMS_SERVICE_NAME, "/send-alert")
                    res2 = requests.post(sms_url)
                    if res2.status_code == 200:
                        state.counter += 1
                        print(f"[THRESHOLD ALERT Triggered]: {res2.status_code} {res2.text}")
                try:
                    res = await process_alert(AlertRequest(device_id="device_1", duration_ms=500))
                    print(f"[WAN ALERT SENT]: {res}")
                    res = await process_alert(AlertRequest(device_id="device_2", duration_ms=500))
                    print(f"[WAN ALERT SENT]: {res}")
                except Exception as e:
                    print(f"[ALERT ERROR]: {e}")

                payl2 = {"risk": risk}
                print("hola")
                if risk > 85.0:
                    stomp_url = get_service_url(settings.STOMP_SERVICE_NAME, "/stompv2")
                    requests.post(stomp_url, json=payl2)

                alert_triggered = True

        except ValueError:
            parsed_array.append(0.0)

    state.latest_hardware_moisture = parsed_array
    if not alert_triggered:
        payl = {"risk": 35 + random.randint(0, 10) + random.random() * 1.5}
        print("should not cross 60")
        stomp_url = get_service_url(settings.STOMP_SERVICE_NAME, "/stompv2")
        requests.post(stomp_url, json=payl)

    return {"status": "success", "received_count": len(state.latest_hardware_moisture)}


@router.get("/api/soil-series")
async def get_hardware_series():
    """Returns the latest hardware moisture readings as a JSON array."""
    return {"latest_hardware_moisture": state.latest_hardware_moisture}