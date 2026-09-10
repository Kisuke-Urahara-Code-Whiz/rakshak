from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random
import json

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Model matching the Notebook payload
class SensorReading(BaseModel):
    timestamp: str
    value: str

# Global memory to store the latest 100 soil values
latest_hardware_moisture = []

# Load the local landslide GeoJSON file
try:
    with open("gsi_landslide_inventory.geojson", "r", encoding="utf-8") as f:
        base_geojson = json.load(f)
except FileNotFoundError:
    print("Warning: gsi_landslide_inventory.geojson not found.")
    base_geojson = {"type": "FeatureCollection", "features": []}

# 2. Hardware POST Endpoint
@app.post("/api/soil/bulk")
async def receive_hardware_data(payload: List[SensorReading]):
    """Receives the 100-message payload from the serial COM script."""
    global latest_hardware_moisture
    
    parsed_array = []
    for item in payload:
        try:
            # Safely cast serial strings to floats
            parsed_array.append(float(item.value))
        except ValueError:
            parsed_array.append(0.0) 
            
    latest_hardware_moisture = parsed_array
    return {"status": "success", "received_count": len(latest_hardware_moisture)}

# 3. React GET Endpoint
@app.get("/api/live-data")
async def get_live_data():
    """Serves map dummy risk values alongside real hardware data."""
    features = []
    
    # Grab the hardware data if the notebook has sent it, otherwise default to empty/zeros
    hardware_array = latest_hardware_moisture if latest_hardware_moisture else [0.0] * 100

    for f in base_geojson.get("features", []):
        props = f.get("properties", {})
        
        # Original Map Risk Logic (Simulated base value for heatmap)
        map_risk_value = round(random.uniform(20.0, 85.0), 1)
        
        # Simulated rainfall metrics
        rain_1h = round(random.uniform(0.0, 15.0), 1)
        rain_24h = round(rain_1h + random.uniform(5.0, 50.0), 1)
        rain_7d = round(rain_24h + random.uniform(20.0, 150.0), 1)

        f["properties"] = {
            **props,
            "value": map_risk_value,                # Powers the heatmap intensity
            "risk": map_risk_value,                 # Displayed on the map hover/click
            "hardware_moisture": hardware_array,    # The 100 real values for the Dashboard graph
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
        features.append(f)
        
    return {"type": "FeatureCollection", "features": features}

if __name__ == "__main__":
    import uvicorn
    # Bound to 8069 to match the target URL in the Jupyter Notebook
    uvicorn.run(app, host="0.0.0.0", port=8000)