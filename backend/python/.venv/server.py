import threading
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import requests
import requests_cache
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from fetchBlock import fetchBlockMain
from SPL import SPLMain, SPLVal
from riskEngine import landslide_risk
load_dotenv()

# --- Cache Configuration ---
requests_cache.install_cache("open_meteo_cache", expire_after=3600)

# --- Global Shared Data Containers & Thread Locks ---
global_data = {
    "spldf": None,
    "maindf": None
}
data_lock = threading.Lock()


# --- Open-Meteo & Data Pipeline Logic ---
def get_precipitation_data(df, bin_decimal_places=1):
    """
    Fetches Open-Meteo precipitation data for all grid blocks using batched
    multi-location API requests, bypassing cache to debug the exact response payload.
    """
    df["lat_bin"] = np.round(df["lat"], bin_decimal_places)
    df["lon_bin"] = np.round(df["lon"], bin_decimal_places)

    unique_coords = df[["lat_bin", "lon_bin"]].drop_duplicates()
    lats = unique_coords["lat_bin"].tolist()
    lons = unique_coords["lon_bin"].tolist()

    total_bins = len(lats)
    print(f"🌦️ Total Blocks: {len(df)} | Unique Bins: {total_bins}")

    rainfall_lookup = {}
    current_hour_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:00")
    
    BATCH_SIZE = 500
    for i in range(0, total_bins, BATCH_SIZE):
        batch_lats = lats[i:i + BATCH_SIZE]
        batch_lons = lons[i:i + BATCH_SIZE]
        
        lat_str = ",".join(map(str, batch_lats))
        lon_str = ",".join(map(str, batch_lons))
        
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat_str}&longitude={lon_str}"
            f"&hourly=precipitation&daily=precipitation_sum&timezone=auto"
        )

        try:
            print(f"\n📡 [BATCH {i // BATCH_SIZE + 1}] Requesting URL (Len: {len(url)})")
            
            # CRITICAL DEBUG: Use requests_cache's contextual control to bypass old broken cached runs
            with requests_cache.disabled():
                response = requests.get(url, timeout=20)
            
            # Print the first 500 characters of the raw text response to see what it actually is!
            print(f"📄 Raw Server Response Preview (Status {response.status_code}):")
            #print("-" * 50)
            #print(response.text[:500])
            #print("-" * 50)

            response.raise_for_status()
            data = response.json()
            results = data if isinstance(data, list) else [data]

            for entry, lat, lon in zip(results, batch_lats, batch_lons):
                hourly = entry.get("hourly", {})
                times = hourly.get("time", [])
                precip_h = hourly.get("precipitation", [])

                try:
                    h_idx = times.index(current_hour_str)
                    rain_1h = precip_h[h_idx]
                except (ValueError, IndexError):
                    rain_1h = precip_h[0] if isinstance(precip_h, list) and precip_h else 0.0

                daily_precip = entry.get("daily", {}).get("precipitation_sum", [])
                rain_24h = daily_precip[0] if daily_precip else 0.0
                rain_7d = sum(daily_precip[:7]) if daily_precip else 0.0

                rainfall_lookup[(lat, lon)] = {
                    "rain_1h": round(rain_1h, 2),
                    "rain_24h": round(rain_24h, 2),
                    "rain_7d": round(rain_7d, 2)
                }

        except Exception as e:
            print(f"❌ Open-Meteo API Error on Batch {i // BATCH_SIZE + 1}: {e}")
            # Dynamic recovery fallback values so your script doesn't crash entirely
            for lat, lon in zip(batch_lats, batch_lons):
                if (lat, lon) not in rainfall_lookup:
                    rainfall_lookup[(lat, lon)] = {"rain_1h": 0.0, "rain_24h": 0.0, "rain_7d": 0.0}

    # Map parameters back safely
    df["rain_1h"] = df.apply(lambda r: rainfall_lookup.get((r["lat_bin"], r["lon_bin"]), {"rain_1h": 0.0})["rain_1h"], axis=1)
    df["rain_24h"] = df.apply(lambda r: rainfall_lookup.get((r["lat_bin"], r["lon_bin"]), {"rain_24h": 0.0})["rain_24h"], axis=1)
    df["rain_7d"] = df.apply(lambda r: rainfall_lookup.get((r["lat_bin"], r["lon_bin"]), {"rain_7d": 0.0})["rain_7d"], axis=1)

    df = df.drop(columns=["lat_bin", "lon_bin"])
    return df

def load_and_process_data():
    """
    Combined loader: Fetches weather columns first, applies heavy 
    SPL calculations second, and returns fully processed DataFrames.
    """
    print("🔄 Initializing unified pipeline data load...")
    
    base_maindf = pd.read_csv("aizawl_1km_static_features_fixed.csv")
    fresh_maindf = get_precipitation_data(base_maindf)
    fresh_spldf = pd.read_csv("SPI_3month.csv")
    
    print("🧮 Calculating internal SPL mappings...")
    fresh_maindf['SPL'] = fresh_maindf.apply(
        lambda row: SPLMain(row['lat'], row['lon'], fresh_spldf, printflag=False)['SPL'], 
        axis=1
    )
    
    print("✅ All metrics loaded and calculated successfully.")
    return fresh_spldf, fresh_maindf


def background_update_job():
    """Trigger target for the APScheduler interval thread."""
    try:
        fresh_spldf, fresh_maindf = load_and_process_data()
        with data_lock:
            global_data["spldf"] = fresh_spldf
            global_data["maindf"] = fresh_maindf
        print("🔁 App-wide DataFrames safely updated in background memory!")
    except Exception as e:
        print(f"❌ Scheduled hourly update pipeline threw an exception: {e}")


# --- STARTUP CONFIGURATION ---
initial_spldf, initial_maindf = load_and_process_data()
global_data["spldf"] = initial_spldf
global_data["maindf"] = initial_maindf

scheduler = BackgroundScheduler()
scheduler.add_job(background_update_job, 'interval', minutes=60) 
scheduler.start()
print("⏰ Hourly background pipeline scheduler initialized successfully.")


# --- Initialize FastAPI Application ---
app = FastAPI(title="Sketchline backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Core App Endpoints ---
@app.get("/")
def home():
    return {"status": "ok", "message": "Hello World"}

@app.get("/api/risk")
def get_risk(lat: float, lon: float):
    fetch_Block = fetchBlockMain(lat, lon, global_data["maindf"], printflag=False)
    min_elev_m = fetch_Block["min_elev_m"]
    max_elev_m = fetch_Block["max_elev_m"]
    mean_elev_m = fetch_Block["mean_elev_m"]
    max_slope_deg = fetch_Block["max_slope_deg"]
    mean_slope_deg = fetch_Block["mean_slope_deg"]
    steep_ratio = fetch_Block["steep_ratio"]
    mean_aspect_deg = fetch_Block["mean_aspect_deg"]
    rainfall_1h = fetch_Block["rain_1h"]
    rainfall_24h = fetch_Block["rain_24h"]
    rainfall_7d = fetch_Block["rain_7d"]
    soil_moisture = SPLVal(lat, lon, global_data["spldf"], printflag=False)
    risk_score = landslide_risk(min_elev_m,
        max_elev_m,
        mean_elev_m,
        max_slope_deg,
        mean_slope_deg,
        steep_ratio,
        mean_aspect_deg,
        rainfall_1h,
        rainfall_24h,
        rainfall_7d,
        soil_moisture)
    return {"status": "ok", "data": risk_score}

@app.get("/api/testrisk")
def get_risk(lat: float, lon: float):
    fetch_Block = fetchBlockMain(lat, lon, global_data["maindf"], printflag=False)
    min_elev_m = fetch_Block["min_elev_m"]
    max_elev_m = fetch_Block["max_elev_m"]
    mean_elev_m = fetch_Block["mean_elev_m"]
    max_slope_deg = fetch_Block["max_slope_deg"]
    mean_slope_deg = fetch_Block["mean_slope_deg"]
    steep_ratio = fetch_Block["steep_ratio"]
    mean_aspect_deg = fetch_Block["mean_aspect_deg"]
    rainfall_1h = 8#fetch_Block["rain_1h"]
    rainfall_24h = 150#fetch_Block["rain_24h"]
    rainfall_7d = 1050#fetch_Block["rain_7d"]
    soil_moisture = 0.9 #SPLVal(lat, lon, global_data["spldf"], printflag=False)
    risk_score = landslide_risk(min_elev_m,
        max_elev_m,
        mean_elev_m,
        max_slope_deg,
        mean_slope_deg,
        steep_ratio,
        mean_aspect_deg,
        rainfall_1h,
        rainfall_24h,
        rainfall_7d,
        soil_moisture)
    return {"status": "ok", "data": risk_score}

@app.get("/api/block")
def get_block(lat: float, lon: float):
    fetch_result = fetchBlockMain(lat, lon, global_data["maindf"], printflag=False)
    return {"status": "ok", "data": fetch_result}

@app.get("/api/df/spl")
def get_df_spl(lat: float, lon: float):
    """
    Fetches pre-loaded parameters from the static DataFrame. 
    Falls back to dynamic string parsing via SPLVal.
    """
    with data_lock:
        df_main = global_data["maindf"]
        df_spl = global_data["spldf"]
        
    if df_main is None or df_spl is None:
        raise HTTPException(status_code=503, detail="Server datasets are initializing.")

    matched = df_main[(df_main['lat'] == lat) & (df_main['lon'] == lon)]
    
    if not matched.empty:
        spl_val = matched["SPL"].values.item()
    else:
        spl_val = str(SPLVal(lat, lon, df_spl, printflag=False))
        
    res = {
        'lat': lat,
        'lon': lon,
        'spl': spl_val
    }
    return {"status": "ok", "data": res}


@app.get("/api/spl")
def get_spl(lat: float, lon: float):
    """Calculates granular lookup properties through full runtime evaluation on demand."""
    with data_lock:
        df_spl = global_data["spldf"]
        
    if df_spl is None:
        raise HTTPException(status_code=503, detail="Server datasets are initializing.")
        
    result = SPLMain(lat, lon, df_spl, printflag=True)
    result_data = result.to_dict() if hasattr(result, 'to_dict') else dict(result)
    
    return {"status": "ok", "data": result_data}


@app.get("/api/rain")
def get_rain_data(lat: float, lon: float):
    """
    Retrieves cached pre-fetched Open-Meteo rainfall parameters from memory 
    based on the requested coordinates.
    """
    with data_lock:
        df_main = global_data["maindf"]

    if df_main is None:
        raise HTTPException(status_code=503, detail="Server datasets are initializing.")

    # Filter by coordinates
    matched = df_main[(df_main['lat'] == lat) & (df_main['lon'] == lon)]

    if not matched.empty:
        # Convert Numpy types to regular Python float types using .item()
        rain_1h = matched["rain_1h"].values.item()
        rain_24h = matched["rain_24h"].values.item()
        rain_7d = matched["rain_7d"].values.item()
    else:
        fetch_result = fetchBlockMain(lat, lon, df_main, printflag=False)
        # Fallback values if coordinate mapping misses the dataset boundaries
        rain_1h, rain_24h, rain_7d = fetch_result.get("rain_1h", 0.0), fetch_result.get("rain_24h", 0.0), fetch_result.get("rain_7d", 0.0)

    return {
        "status": "ok",
        "data": {
            "lat": lat,
            "lon": lon,
            "rain_1h": rain_1h,
            "rain_24h": rain_24h,
            "rain_7d": rain_7d
        }
    }
