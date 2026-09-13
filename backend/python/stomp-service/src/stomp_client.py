import json
import stomp
from stomp.adapter.ws import WSStompConnection

from src.config import settings
from src.eureka import get_room_service_host_port


class MyListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print(f"[ERROR] {frame.body}")

    def on_message(self, frame):
        print(f"[RECEIVED] {frame.body}")

    def on_connected(self, frame):
        print("[CONNECTED] Successfully connected to STOMP server!")


conn: stomp.WSStompConnection | None = None


def get_stomp_connection() -> WSStompConnection | None:
    """Ensures active STOMP connection using dynamic host and port from room-service."""
    global conn
    if conn is None or not conn.is_connected():
        host, port, use_ssl = get_room_service_host_port()
        print(f"Connecting to STOMP server via room-service at {host}:{port} (SSL={use_ssl})...")

        conn = stomp.WSStompConnection([(host, port)], ws_path=settings.WS_PATH)
        if use_ssl:
            conn.set_ssl([(host, port)])

        conn.set_listener("", MyListener())
        conn.connect(wait=True)
        conn.subscribe(destination=settings.SUBSCRIBE_DESTINATION, id=1, ack="auto")

    return conn


def send_single_risk(risk: float):
    connection = get_stomp_connection()
    payload_dict = {"riskPercentage": str(risk)}
    payload_json = json.dumps(payload_dict)
    connection.send(body=payload_json, destination=settings.SEND_DESTINATION)
    print(f"[SUCCESS] Sent single risk: {risk}")


def process_and_send_risks(arr: list[float]):
    connection = get_stomp_connection()
    for risk_percentage in arr:
        payload_dict = {"riskPercentage": str(risk_percentage)}
        payload_json = json.dumps(payload_dict)
        connection.send(body=payload_json, destination=settings.SEND_DESTINATION)
    print(f"[SUCCESS] Sent {len(arr)} items successfully.")