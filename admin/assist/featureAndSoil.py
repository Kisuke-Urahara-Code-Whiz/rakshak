from urllib import response
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List  # <-- Import List tracking
import pandas as pd
from SPL import SPLVal
app = FastAPI()
spldf  = pd.read_csv("./assist/SPI_3month.csv")
df = pd.read_csv("./assist/northeast_1km_static_features.csv")
import numpy as np
from scipy.spatial import KDTree
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def find_closest_location(query_lat, query_lon, data_df, lat_col='lat', lon_col='lon'):
    def lat_long_to_3d(lat, lon):
        lat_rad = np.radians(lat)
        lon_rad = np.radians(lon)
        x = np.cos(lat_rad) * np.cos(lon_rad)
        y = np.cos(lat_rad) * np.sin(lon_rad)
        z = np.sin(lat_rad)
        return np.column_stack((x, y, z)) if isinstance(lat, np.ndarray) else np.array([[x, y, z]])
    ref_lats = data_df[lat_col].to_numpy()
    ref_lons = data_df[lon_col].to_numpy()
    spatial_vectors = lat_long_to_3d(ref_lats, ref_lons)
    spatial_index = KDTree(spatial_vectors)
    query_vector = lat_long_to_3d(query_lat, query_lon)
    _, closest_idx = spatial_index.query(query_vector)
    return data_df.iloc[closest_idx[0]]

@app.get("/soil-moisture")
async def get_soil_moisture(lat: float, llong: float):
    rowval = SPLVal(lat, llong, spldf, printflag=False)
    scaled = (rowval + 1) * 50
    return {"soil_moisture": np.clip(scaled, 0, 100)}

@app.get("/static-features")
async def get_static_features(lat: float, llong: float):
    row = find_closest_location(lat, llong, df)
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
        "mean_twi": float(row["mean_twi"])
    }
    if row.empty:
        raise HTTPException(status_code=404, detail="Feature not found")
    return ret
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8082)
