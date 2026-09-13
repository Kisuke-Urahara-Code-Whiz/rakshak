import numpy as np
from scipy.spatial import KDTree


def normalize(value, min_val, max_val):
    """Helper function to scale values between 0 and 100."""
    if max_val == min_val:
        return 0
    scaled = ((value - min_val) / (max_val - min_val)) * 100
    return np.clip(scaled, 0, 100)


def lat_long_to_3d(lat, lon):
    """Converts Latitude and Longitude to 3D Cartesian coordinates."""
    lat_rad = np.radians(lat)
    lon_rad = np.radians(lon)
    x = np.cos(lat_rad) * np.cos(lon_rad)
    y = np.cos(lat_rad) * np.sin(lon_rad)
    z = np.sin(lat_rad)
    return np.column_stack((x, y, z)) if isinstance(lat, np.ndarray) else np.array([[x, y, z]])


def find_closest_location(query_lat, query_lon, data_df, lat_col="lat", lon_col="lon"):
    ref_lats = data_df[lat_col].to_numpy()
    ref_lons = data_df[lon_col].to_numpy()
    spatial_vectors = lat_long_to_3d(ref_lats, ref_lons)
    spatial_index = KDTree(spatial_vectors)

    query_vector = lat_long_to_3d(query_lat, query_lon)
    _, closest_idx = spatial_index.query(query_vector)
    return data_df.iloc[closest_idx[0]]


def SPLVal(lat, llong, spldf, printflag=True):
    row = find_closest_location(lat, llong, spldf, lat_col="Lat", lon_col="Long")
    if printflag:
        print(f"Closest Match: Lat {row['Lat']}, Lon {row['Long']}")
        print(f"Soil Moisture Level: {row['SPL']}")
    return row["SPL"]


def SPLMain(lat, llong, spldf, printflag=True):
    row = find_closest_location(lat, llong, spldf, lat_col="Lat", lon_col="Long")
    if printflag:
        print(f"Closest Match: Lat {row['Lat']}, Lon {row['Long']}")
        print(f"Soil Moisture Level: {row['SPL']}")
    return row