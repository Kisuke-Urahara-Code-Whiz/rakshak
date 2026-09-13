from fastapi import APIRouter, HTTPException
from ..data_loader import df
from ..spatial import find_closest_location

router = APIRouter()


@router.get("/static-features")
async def get_static_features(lat: float, llong: float):
    row = find_closest_location(lat, llong, df)
    if row.empty:
        raise HTTPException(status_code=404, detail="Feature not found")

    print(f"Closest Match: Lat {row['lat']}, Lon {row['lon']}")
    ret = {
        "max_elev_m": float(row["max_elev_m"]),
        "mean_elev_m": float(row["mean_elev_m"]),
        "max_slope_deg": float(row["max_slope_deg"]),
        "mean_slope_deg": float(row["mean_slope_deg"]),
        "steep_ratio": float(row["steep_ratio"]),
        "mean_aspect_deg": float(row["mean_aspect_deg"]),
        "mean_profile_curvature": float(row["mean_profile_curvature"]),
        "mean_plan_curvature": float(row["mean_plan_curvature"]),
        "max_flow_accumulation": float(row["max_flow_accumulation"]),
        "mean_twi": float(row["mean_twi"]),
    }
    return ret