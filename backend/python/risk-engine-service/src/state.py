from typing import List
from alert_manager import AlertManager

manager = AlertManager()
latest_hardware_moisture: List[float] = []
counter: int = 0