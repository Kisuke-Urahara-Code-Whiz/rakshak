from schemas import AlertRequest
from state import manager


async def process_alert(req: AlertRequest):
    if req.device_id:
        sent = await manager.send_alert(req.device_id, req.duration_ms)
        if not sent:
            return {"status": "error", "detail": f"Device {req.device_id} offline"}
        return {"status": "Alert sent to device", "target": req.device_id}
    else:
        count = await manager.broadcast_alert(req.duration_ms)
        return {"status": "Broadcast alert sent", "notified_devices": count}