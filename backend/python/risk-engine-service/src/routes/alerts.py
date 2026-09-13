from fastapi import APIRouter, HTTPException
from schemas import AlertRequest
from services import process_alert

router = APIRouter()

@router.post("/trigger-alert")
async def trigger_alert_route(req: AlertRequest):
    res = await process_alert(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res["detail"])
    return res