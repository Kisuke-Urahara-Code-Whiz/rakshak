import py_eureka_client.eureka_client as eureka_client
from py_eureka_client.http_client import HttpResponse

from config import settings


async def init_eureka():
    """Registers the service with Eureka and schedules heartbeats every 30 seconds."""
    await eureka_client.init_async(
        eureka_server=settings.EUREKA_SERVER,
        app_name=settings.APP_NAME,
        instance_port=settings.SERVER_PORT,
        renewal_interval_in_secs=settings.HEARTBEAT_INTERVAL_SECS,
        duration_in_secs=90,
    )
    print(f"[{settings.APP_NAME}] Registered with Eureka at {settings.EUREKA_SERVER}")


async def stop_eureka():
    """Deregisters the service on shutdown."""
    await eureka_client.stop_async()
    print(f"[{settings.APP_NAME}] Deregistered from Eureka")


def get_service_url(service_name: str, path: str = "") -> str | dict | HttpResponse:
    """Discovers instance of service_name from Eureka and returns full route."""
    cleaned_path = "/" + path.lstrip("/") if path else ""
    return eureka_client.walk_nodes(
        service_name,
        cleaned_path,
        walker=lambda target_url: target_url,
    )