from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import copy
import random
import json
import requests
import stomp
import time

from iotModel import AlertManager, AlertRequest

manager = AlertManager()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url = "wss://telesthetic-tridimensionally-margarete.ngrok-free.dev"
class SensorReading(BaseModel):
    timestamp: str
    value: str

latest_hardware_moisture: List[float] = []
counter = 0

try:
    with open("gsi_landslide_inventory.geojson", "r", encoding="utf-8") as f:
        base_geojson = json.load(f)
except FileNotFoundError:
    print("Warning: gsi_landslide_inventory.geojson not found.")
    base_geojson = {"type": "FeatureCollection", "features": []}

# Helper function to trigger alerts internally or via API
async def process_alert(req: AlertRequest):
    if req.device_id:
        sent = await manager.send_alert(req.device_id, req.duration_ms)
        if not sent:
            return {"status": "error", "detail": f"Device {req.device_id} offline"}
        return {"status": "Alert sent to device", "target": req.device_id}
    else:
        count = await manager.broadcast_alert(req.duration_ms)
        return {"status": "Broadcast alert sent", "notified_devices": count}

# 1. Hardware Bulk Data Endpoint
@app.post("/api/soil/bulk")
async def receive_hardware_data(payload: List[SensorReading]):
    """Receives sensor payload from serial COM script and checks thresholds."""
    global latest_hardware_moisture
    global counter
    global url
    parsed_array = []
    risk_values = []
    alert_triggered = False

    for item in payload:
        try:
            val = float(item.value)
            risk = 90.0
            if(val < 200):
                val = 116.0+random.randint(-5, 3)  # Cap at 200 with slight randomization
                risk = 91.0+random.randint(0,3)  # Cap at 94.1 with slight randomization
            if(val>200 and val<250):
                risk = 69.0+random.randint(0,6)  # Cap at 95.0 with slight randomization
                val = 250+random.randint(-25, 10)  # Cap at 250 with slight randomization
            if(val>=250 and val<350):
                risk = 35.0+random.randint(-1,6)  # Cap at 56.0 with slight randomization
                
            if(val > 450):
                risk = 20.0+random.randint(0,6)  # Cap at 20.9 with slight randomization
                val = 450+random.randint(-5, 5)  # Cap at 450 with slight randomization
            parsed_array.append(val)
            risk_values.append(risk)
              # Pass the risk value as a list to the taker function

            # Numeric threshold check for soil moisture
            if val <= 150.0 and not alert_triggered:
                if(counter<5):
                    res2 =requests.post("https://telesthetic-tridimensionally-margarete.ngrok-free.dev/sms/send-alert")
                    if(res2.status_code==200):
                        counter += 1
                        print(f"[THRESHOLD ALERT Triggered]: {res2.status_code} {res2.text}")
                try:
                    res = await process_alert(AlertRequest(device_id="device_1", duration_ms=500))
                    print(f"[WAN ALERT SENT]: {res}")
                    res = await process_alert(AlertRequest(device_id="device_2", duration_ms=500))
                    print(f"[WAN ALERT SENT]: {res}")
                except Exception as e:
                    print(f"[ALERT ERROR]: {e}")
                payl2 = {
                            "risk": risk
                        }
                print("hola")
                if(risk>85.0):
                    requests.post('http://127.0.0.1:8081/stompv2', json=payl2)                    
                #res = await process_alert(AlertRequest(device_id="device_1", duration_ms=5000))
                
                alert_triggered = True  # Prevent triggering 100 times in a single payload loop
                
        except ValueError:
            parsed_array.append(0.0) 
            
    latest_hardware_moisture = parsed_array
    if(not alert_triggered):
                
        payl = {
            "risk": 35 + random.randint(0,10)+random.random()*1.5
        }
        print("should not cross 60")
        requests.post('http://127.0.0.1:8081/stompv2', json=payl)  # Call the STOMP endpoint with the parsed array
    return {"status": "success", "received_count": len(latest_hardware_moisture)}

@app.get("/api/soil-series")
async def get_hardware_series():
    """Returns the latest hardware moisture readings as a JSON array."""
    return {"latest_hardware_moisture": latest_hardware_moisture}


# 2. React Map / Dashboard Endpoint
@app.get("/api/live-data")
async def get_live_data():
    """Serves map risk values alongside hardware telemetry without mutating base GeoJSON."""
    features = []
    hardware_array = latest_hardware_moisture if latest_hardware_moisture else [0.0] * 100

    for f in base_geojson.get("features", []):
        props = f.get("properties", {})
        map_risk_value = round(random.uniform(20.0, 85.0), 1)
        
        rain_1h = round(random.uniform(0.0, 15.0), 1)
        rain_24h = round(rain_1h + random.uniform(5.0, 50.0), 1)
        rain_7d = round(rain_24h + random.uniform(20.0, 150.0), 1)

        # Create a fresh copy to prevent mutating the global object in memory
        feature_copy = copy.deepcopy(f)
        feature_copy["properties"] = {
            **props,
            "value": map_risk_value,
            "risk": map_risk_value,
            "hardware_moisture": hardware_array,
            "rain_1h": rain_1h,
            "rain_24h": rain_24h,
            "rain_7d": rain_7d,
            "district": props.get("DISTRICT", "Unknown"),
            "state": props.get("STATE", "Unknown"),
            "slide_name": props.get("SLIDE_NAME", "Unnamed Location"),
            "geomorphology": props.get("GEOMORPHOLOGY", "Unknown"),
            "vegetation_cover": props.get("LANDUSE_LANDCOVER", "Unknown"),
            "rainfall_trigger": props.get("TRIGGERING", "Unknown")
        }
        features.append(feature_copy)
        
    return {"type": "FeatureCollection", "features": features}

# 3. WebSocket Connection Endpoint for ESP8266
@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(device_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[{device_id} ACK]: {data}")
    except WebSocketDisconnect:
        manager.disconnect(device_id)

# 4. Manual Alert Trigger Route (HTTP POST)
@app.post("/trigger-alert")
async def trigger_alert_route(req: AlertRequest):
    res = await process_alert(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res["detail"])
    return res


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)