from fastapi import APIRouter
from ..schemas import RiskReq, RiskRequest
from ..stomp_client import process_and_send_risks, send_single_risk

router = APIRouter()


@router.post("/stomp")
def stomp_endpoint(data: RiskRequest):
    try:
        process_and_send_risks(data.risks)
        return {"status": "success", "items_sent": len(data.risks)}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.post("/stompv2")
def stomp_endpoint2(data: RiskReq):
    try:
        send_single_risk(data.risk)
        return {"status": "success", "items_sent": 1}
    except Exception as e:
        print(f"[STOMP ERROR] Failed to broadcast single risk: {e}")
        return {"status": "failed", "error": str(e)}