import copy
import random
from fastapi import APIRouter

from .. import state
from ..config import BASE_GEOJSON

router = APIRouter()

@router.get("/api/live-data")
async def get_live_data():
    """Serves map risk values alongside hardware telemetry without mutating base GeoJSON."""
    features = []
    hardware_array = (
        state.latest_hardware_moisture if state.latest_hardware_moisture else [0.0] * 100
    )

    for f in BASE_GEOJSON.get("features", []):
        props = f.get("properties", {})
        map_risk_value = round(random.uniform(20.0, 85.0), 1)

        rain_1h = round(random.uniform(0.0, 15.0), 1)
        rain_24h = round(rain_1h + random.uniform(5.0, 50.0), 1)
        rain_7d = round(rain_24h + random.uniform(20.0, 150.0), 1)

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
            "rainfall_trigger": props.get("TRIGGERING", "Unknown"),
        }
        features.append(feature_copy)

    return {"type": "FeatureCollection", "features": features}