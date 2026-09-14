import numpy as np
from fastapi import APIRouter
from ..data_loader import spldf
from ..spatial import SPLVal

router = APIRouter()


@router.get("/soil-moisture")
async def get_soil_moisture(lat: float, llong: float):
    rowval = SPLVal(lat, llong, spldf, printflag=False)
    scaled = (rowval + 1) * 50
    return {"soil_moisture": float(np.clip(scaled, 0, 100))}