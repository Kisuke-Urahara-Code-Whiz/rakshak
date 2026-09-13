from pydantic import Field, computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Eureka configuration from Docker Compose
    EUREKA_HOST: str = Field(
        default="localhost", validation_alias="EUREKA_SERVER_HOST"
    )
    EUREKA_PORT: int = Field(default=5000, validation_alias="EUREKA_SERVER_PORT")

    # Service identification
    APP_NAME: str = "stomp-service"
    SERVER_PORT: int = Field(default=8081, validation_alias="PORT")
    HEARTBEAT_INTERVAL_SECS: int = 30

    # Target service in Eureka
    ROOM_SERVICE_NAME: str = "room-service"

    # Default fallback STOMP / WS destination parameters
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

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()