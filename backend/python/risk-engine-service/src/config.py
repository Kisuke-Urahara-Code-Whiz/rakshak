import json
from pathlib import Path
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
GEOJSON_PATH = BASE_DIR / "gsi_landslide_inventory.geojson"


class Settings(BaseSettings):
    EUREKA_HOST: str = "localhost"
    EUREKA_PORT: int = 5000

    APP_NAME: str = "risk-engine-service"
    SERVER_PORT: int = 8000
    HEARTBEAT_INTERVAL_SECS: int = 30

    SMS_SERVICE_NAME: str = "sms-service"
    STOMP_SERVICE_NAME: str = "stomp-service"

    @computed_field
    @property
    def EUREKA_SERVER(self) -> str:
        return f"http://{self.EUREKA_HOST}:{self.EUREKA_PORT}/eureka"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()

try:
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        BASE_GEOJSON = json.load(f)
except FileNotFoundError:
    print(f"Warning: {GEOJSON_PATH} not found.")
    BASE_GEOJSON = {"type": "FeatureCollection", "features": []}