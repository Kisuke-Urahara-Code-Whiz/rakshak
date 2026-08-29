import numpy as np


def landslide_risk(
    min_elev_m,
    max_elev_m,
    mean_elev_m,
    max_slope_deg,
    mean_slope_deg,
    steep_ratio,
    mean_aspect_deg,
    rainfall_1h,
    rainfall_24h,
    rainfall_7d,
    soil_moisture,
):
    """Rule-based landslide risk engine."""

    def score(value, low, high):
        return np.clip((value - low) / (high - low) * 100, 0, 100)

    # 1. STATIC TERRAIN SCORE
    mean_slope_score = score(mean_slope_deg, 5, 40)
    max_slope_score = score(max_slope_deg, 15, 60)
    steep_ratio_score = np.clip(steep_ratio * 100, 0, 100)

    elevation_range = max_elev_m - min_elev_m
    relief_score = score(elevation_range, 50, 500)
    elevation_score = score(mean_elev_m, 100, 2000)
    aspect_score = 50

    static_score = (
        0.30 * mean_slope_score
        + 0.25 * max_slope_score
        + 0.20 * steep_ratio_score
        + 0.15 * relief_score
        + 0.08 * elevation_score
        + 0.02 * aspect_score
    )

    # 2. DYNAMIC TRIGGER SCORE (FIXED)
    rainfall_1h_score = score(rainfall_1h, 0, 40)
    rainfall_24h_score = score(rainfall_24h, 0, 120)
    rainfall_7d_score = score(rainfall_7d, 0, 400)

    # FIX: Corrected clip range for 0.0 - 1.0 soil moisture inputs
    soil_moisture_score = np.clip(soil_moisture * 100, 0, 100)

    dynamic_score = (
        0.35 * rainfall_1h_score
        + 0.35 * rainfall_24h_score
        + 0.15 * rainfall_7d_score
        + 0.15 * soil_moisture_score
    )

    # 3. FINAL RISK SCORE & OVERRIDES
    # Use standard weighted score as base
    risk_score = 0.50 * static_score + 0.50 * dynamic_score

    # OVERRIDE: High static susceptibility + high dynamic trigger accelerates overall risk
    if dynamic_score >= 80 and static_score >= 40:
        risk_score = max(risk_score, dynamic_score)

    risk_score = float(np.clip(risk_score, 0, 100))

    # 4. RISK ZONES
    if risk_score < 20:
        risk_zone = "VERY LOW"
    elif risk_score < 40:
        risk_zone = "LOW"
    elif risk_score < 60:
        risk_zone = "MODERATE"
    elif risk_score < 80:
        risk_zone = "HIGH"
    else:
        risk_zone = "SEVERE"

    return {
        "risk_score": round(risk_score, 2),
        "risk_zone": risk_zone,
        "static_score": round(static_score, 2),
        "dynamic_score": round(dynamic_score, 2),
    }