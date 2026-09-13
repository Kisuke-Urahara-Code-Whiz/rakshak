from pathlib import Path
from pydantic import Field, computed_field
from pydantic_settings import BaseSettings

# Project root (one level above src/)
BASE_DIR = Path(__file__).resolve().parent.parent

SPI_CSV_PATH = BASE_DIR / "SPI_3month.csv"
STATIC_FEATURES_CSV_PATH = BASE_DIR / "northeast_1km_static_features.csv"


class Settings(BaseSettings):
    # Eureka configuration from Docker Compose or defaults
    EUREKA_HOST: str = Field(
        default="localhost", validation_alias="EUREKA_SERVER_HOST"
    )
    EUREKA_PORT: int = Field(default=5000, validation_alias="EUREKA_SERVER_PORT")

    APP_NAME: str = "static-loader-service"
    SERVER_PORT: int = Field(default=8082, validation_alias="PORT")
    HEARTBEAT_INTERVAL_SECS: int = 30

    @computed_field
    @property
    def EUREKA_SERVER(self) -> str:
        return f"http://{self.EUREKA_HOST}:{self.EUREKA_PORT}/eureka"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()