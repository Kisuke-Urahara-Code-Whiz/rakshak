from pathlib import Path
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
SPI_CSV_PATH = BASE_DIR / "assist" / "SPI_3month.csv"
STATIC_FEATURES_CSV_PATH = BASE_DIR / "assist" / "northeast_1km_static_features.csv"


class Settings(BaseSettings):
    EUREKA_HOST: str = "localhost"
    EUREKA_PORT: int = 5000

    APP_NAME: str = "static-loader-service"
    SERVER_PORT: int = 8001
    HEARTBEAT_INTERVAL_SECS: int = 30

    @computed_field
    @property
    def EUREKA_SERVER(self) -> str:
        return f"http://{self.EUREKA_HOST}:{self.EUREKA_PORT}/eureka"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()