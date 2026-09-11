import fastapi
import stomp
import json
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel  # Added for request body validation

app = fastapi.FastAPI()

HOST = 'telesthetic-tridimensionally-margarete.ngrok-free.dev'
PORT = 443 
WS_PATH = '/room/ws'
SEND_DESTINATION = '/topic/risk'
SUBSCRIBE_DESTINATION = '/topic/risk' 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a Pydantic schema for the POST request body
class RiskReq(BaseModel):
    risk: float
class RiskRequest(BaseModel):
    risks: List[float]

class MyListener(stomp.ConnectionListener):
    def on_error(self, frame):
        print(f"[ERROR] {frame.body}")
        
    def on_message(self, frame):
        print(f"[RECEIVED] {frame.body}")
        
    def on_connected(self, frame):
        print("[CONNECTED] Successfully connected to STOMP server!")

# Initialize connection once at module level
conn = stomp.WSStompConnection([(HOST, PORT)], ws_path=WS_PATH)
conn.set_ssl([(HOST, PORT)])
conn.set_listener('', MyListener())

def get_stomp_connection():
    """Ensures the connection is active before sending messages."""
    if not conn.is_connected():
        print("Connecting to STOMP server...")
        conn.connect(wait=True)
        # Subscribe once upon successful connection
        conn.subscribe(destination=SUBSCRIBE_DESTINATION, id=1, ack='auto')
    return conn

def process_and_send_risks(arr):
    try:
        connection = get_stomp_connection()
        
        # Loop through the array and send data over the open connection
        for risk_percentage in arr:
            payload_dict = {"riskPercentage": str(risk_percentage)}
            payload_json = json.dumps(payload_dict)            
            connection.send(body=payload_json, destination=SEND_DESTINATION)
            
        print(f"[SUCCESS] Sent {len(arr)} items successfully.")
    except Exception as e:
        print(f"[STOMP ERROR] Failed to broadcast bulk array: {e}")
        raise e

# Changed from @app.get to @app.post
@app.post('/stomp')
def stomp_endpoint(data: RiskRequest):
    try:
        # Extract the list from the validated request body
        process_and_send_risks(data.risks)
        return {"status": "success", "items_sent": len(data.risks)}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
@app.post('/stompv2')
def stomp_endpoint2(data: RiskReq):
    try:
        connection = get_stomp_connection()
        payload_dict = {"riskPercentage": str(data.risk)}
        payload_json = json.dumps(payload_dict)            
        connection.send(body=payload_json, destination=SEND_DESTINATION)
        print(f"[SUCCESS] Sent ")
    except Exception as e:
            print(f"[STOMP ERROR] Failed to broadcast bulk array: {e}")
            raise e
    try:
        return {"status": "success", "items_sent": 1}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)