from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    EUREKA_HOST: str = "localhost"
    EUREKA_PORT: int = 5000

    APP_NAME: str = "stomp-service"
    SERVER_PORT: int = 5008
    HEARTBEAT_INTERVAL_SECS: int = 30

    ROOM_SERVICE_NAME: str = "room-service"
    DEFAULT_STOMP_HOST: str = "localhost"
    DEFAULT_STOMP_PORT: int = 8080
    DEFAULT_USE_SSL: bool = False
    WS_PATH: str = "/ws"
    SEND_DESTINATION: str = "/topic/risk"
    SUBSCRIBE_DESTINATION: str = "/topic/risk"

    @computed_field
    @property
    def EUREKA_SERVER(self) -> str:
        return f"http://{self.EUREKA_HOST}:{self.EUREKA_PORT}/eureka"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()