from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("gsi_landslide_inventory.geojson", "r", encoding="utf-8") as f:
    base_geojson = json.load(f)

@app.get("/api/live-data")
async def get_live_data():
    features = []
    for f in base_geojson.get("features", []):
        props = f.get("properties", {})
        # Dynamic 100-frame soil moisture array
        frame_values = [round(random.uniform(25.0, 92.0), 1) for _ in range(100)]
        mean_val = round(sum(frame_values) / len(frame_values), 1)

        f["properties"] = {
            **props,
            "live_moisture": frame_values,
            "avg_moisture": mean_val,
            "value": mean_val,
            "district": props.get("DISTRICT", "Unknown"),
            "state": props.get("STATE", "Unknown"),
            "slide_name": props.get("SLIDE_NAME", ""),
            "vegetation_cover": props.get("LANDUSE_LANDCOVER", "Sparse vegetation"),
            "rainfall_trigger": props.get("TRIGGERING", "Rainfall"),
        }
        features.append(f)
    return {"type": "FeatureCollection", "features": features}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
