import py_eureka_client.eureka_client as eureka_client
from src.config import settings


async def init_eureka():
    """Registers static-loader-service to Eureka and starts 30-second heartbeats."""
    await eureka_client.init_async(
        eureka_server=settings.EUREKA_SERVER,
        app_name=settings.APP_NAME,
        instance_port=settings.SERVER_PORT,
        renewal_interval_in_secs=settings.HEARTBEAT_INTERVAL_SECS,
        duration_in_secs=90,
    )
    print(f"[{settings.APP_NAME}] Registered with Eureka at {settings.EUREKA_SERVER}")


async def stop_eureka():
    """Gracefully unregisters service from Eureka on shutdown."""
    await eureka_client.stop_async()
    print(f"[{settings.APP_NAME}] Deregistered from Eureka")