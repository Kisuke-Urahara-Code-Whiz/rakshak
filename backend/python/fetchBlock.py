import numpy as np
from scipy.spatial import KDTree
import pandas as pd

def normalize(value, min_val, max_val):
    """Helper function to scale values between 0 and 100."""
    if max_val == min_val:
        return 0
    # Use pandas or numpy clipping to handle both scalars and series safely
    scaled = ((value - min_val) / (max_val - min_val)) * 100
    return np.clip(scaled, 0, 100)

def lat_long_to_3d(lat, lon):
    """Converts Latitude and Longitude to 3D Cartesian coordinates."""
    lat_rad = np.radians(lat)
    lon_rad = np.radians(lon)
    x = np.cos(lat_rad) * np.cos(lon_rad)
    y = np.cos(lat_rad) * np.sin(lon_rad)
    z = np.sin(lat_rad)
    return np.column_stack((x, y, z)) if isinstance(lat, np.ndarray) else (x, y, z)

def fetch_block(query_lat, query_lon):
    query_vector = lat_long_to_3d(query_lat, query_lon)
    _, closest_idx = spatial_index.query(query_vector)    
    return df.iloc[closest_idx]

def fetchBlockMain(lat, llong,maindf,printflag=True):
    global df, spatial_index
    df = maindf
    lats = np.array(df['lat'].values)
    lons = np.array(df['lon'].values)
    spatial_vectors = lat_long_to_3d(lats, lons)
    spatial_index = KDTree(spatial_vectors)
    result = fetch_block(lat, llong)
    if printflag:
        print("Closest Match: \n", result)
    return result
if __name__ == "__main__":
    df = pd.read_csv("aizawl_1km_static_features_fixed.csv")
    result = fetchBlockMain(23.73, 92.72, df, printflag=True)
    print("Fetched Block Data:\n", result.get("rain_1h",0.0), result.get("rain_24h", 0.0), result.get("rain_7d", 0.0))