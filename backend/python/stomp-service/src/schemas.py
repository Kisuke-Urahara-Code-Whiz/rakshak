from typing import List
from pydantic import BaseModel


class RiskReq(BaseModel):
    risk: float


class RiskRequest(BaseModel):
    risks: List[float]