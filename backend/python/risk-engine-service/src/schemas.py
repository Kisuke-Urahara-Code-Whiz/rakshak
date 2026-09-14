from pydantic import BaseModel


class SensorReading(BaseModel):
    timestamp: str
    value: str

class AlertRequest(BaseModel):
    device_id: str | None = None
    duration_ms: int = 2000