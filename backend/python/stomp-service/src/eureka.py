from typing import Tuple
import py_eureka_client.eureka_client as eureka_client
from src.config import settings


async def init_eureka():
    """Registers stomp-service with Eureka and initiates heartbeats every 30s."""
    await eureka_client.init_async(
        eureka_server=settings.EUREKA_SERVER,
        app_name=settings.APP_NAME,
        instance_port=settings.SERVER_PORT,
        renewal_interval_in_secs=settings.HEARTBEAT_INTERVAL_SECS,
        duration_in_secs=90,
    )
    print(f"[{settings.APP_NAME}] Registered with Eureka at {settings.EUREKA_SERVER}")


async def stop_eureka():
    """Gracefully unregisters from Eureka on shutdown."""
    await eureka_client.stop_async()
    print(f"[{settings.APP_NAME}] Deregistered from Eureka")


def get_room_service_host_port() -> Tuple[str, int, bool]:
    """Resolves room-service instance host, port, and SSL status from Eureka."""
    try:
        instance = eureka_client.get_instance(settings.ROOM_SERVICE_NAME)
        if instance:
            host = instance.ipAddr or instance.hostName
            is_ssl = instance.securePortEnabled
            port = instance.securePort if is_ssl else instance.port.port
            return host, int(port), is_ssl
    except Exception as e:
        print(f"[EUREKA LOOKUP WARNING] Could not resolve {settings.ROOM_SERVICE_NAME}: {e}")

    # Fallback to local configuration if discovery is unreachable
    return settings.DEFAULT_STOMP_HOST, settings.DEFAULT_STOMP_PORT, settings.DEFAULT_USE_SSL