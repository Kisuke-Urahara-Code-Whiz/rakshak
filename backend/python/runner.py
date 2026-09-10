from riskEngine import landslide_risk
import numpy as np
import pandas as pd
df = pd.read_csv("compiled_landslide_benchmark_dataset.csv")
print(df.iloc[0])
# Scenario 1: Extreme Flash Flood & Landslide
extreme_1 = landslide_risk(
    min_elev_m=750,
    max_elev_m=1200,
    mean_elev_m=1200,
    max_slope_deg=55,
    mean_slope_deg=38,
    steep_ratio=0.85,
    mean_aspect_deg=180,
    rainfall_1h=65,
    rainfall_24h=220,
    rainfall_7d=600,
    soil_moisture=0.95,
)

# Scenario 3: Flat Plain with Torrential Rain
extreme_3 = landslide_risk(
    min_elev_m=40,
    max_elev_m=50,
    mean_elev_m=50,
    max_slope_deg=4,
    mean_slope_deg=2,
    steep_ratio=0.00,
    mean_aspect_deg=90,
    rainfall_1h=80,
    rainfall_24h=300,
    rainfall_7d=850,
    soil_moisture=1.00,
)
for index, row in df.iterrows():
    risk_score = landslide_risk(
        min_elev_m=row['min_elev_m'],
        max_elev_m=row['max_elev_m'],
        mean_elev_m=row['mean_elev_m'],
        max_slope_deg=row['max_slope_deg'],
        mean_slope_deg=row['mean_slope_deg'],
        steep_ratio=row['steep_ratio'],
        mean_aspect_deg=row['mean_aspect_deg'],
        rainfall_1h=row['rainfall_1h'],
        rainfall_24h=row['rainfall_24h'],
        rainfall_7d=row['rainfall_7d'],
        soil_moisture=row['soil_moisture'],
    )
    print(f"Row {index} Risk Score: {risk_score} Generated: {row['risk_score']}")
print("Scenario 1 (Worst Case):", extreme_1)
print("Scenario 3 (Flat/Heavy Rain):", extreme_3)