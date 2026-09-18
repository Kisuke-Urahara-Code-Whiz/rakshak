from typing import Dict, Union
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[Union[str, int], WebSocket]] = {
            "ESP": {},
            "SOIL": {},
            "MAIN": {},
            "FRONT":{}
        }

    async def connect(self,role: str,client_id: Union[str, int],websocket: WebSocket):
        await websocket.accept()
        if role not in self.active_connections:
            self.active_connections[role] = {}
        self.active_connections[role][client_id] = websocket

    def disconnect(self, role: str, client_id: Union[str, int]):
        if role in self.active_connections:
            self.active_connections[role].pop(client_id, None)

    async def broadcast_to_role(self, message: str, role: str):
        if role not in self.active_connections:
            return

        for client_id, connection in list(self.active_connections[role].items()):
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"[WS] Failed sending to {role} client '{client_id}': {e}. Removing stale client.")
                self.disconnect(role, client_id)
                try:
                    await connection.close()
                except Exception:
                    pass

    async def send_private_message(
        self,
        message: str,
        role: str,
        client_id: Union[str, int]
    ):
        websocket = self.active_connections.get(role, {}).get(client_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(role, client_id)

    '''async def broadcast_to_role(
        self,
        message: str,
        role: str
    ):
        if role not in self.active_connections:
            return

        for client_id, connection in list(self.active_connections[role].items()):
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"[WS] Failed sending to {role} client '{client_id}': {e}. Removing stale client.")
                # Clean up stale/ghost connections automatically
                self.disconnect(role, client_id)'''