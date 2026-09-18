import asyncio
import json
import random
import sys
import websockets

SERVER_URI = "ws://localhost:8000/ws/soil/sensor_node_01"

async def simulate_soil_sensor():
    print(f" Connecting to FastAPI WebSocket: {SERVER_URI}...")
    try:
        async with websockets.connect(SERVER_URI) as websocket:
            print(" Connected! Starting gradual telemetry transmission (Normal -> Risk -> Critical -> Recovery)...\n")

            # Simulation Phases: (Soil Moisture, Vibration (0-1), Steps in Phase, Delay Per Step)
            phases = [
                # Phase 1: Normal Baseline State (Moisture > 250, Low Vib)
                {"name": "NORMAL STABILITY", "start_soil": 450, "end_soil": 320, "start_vib": 0.05, "end_vib": 0.12, "steps": 10, "delay": 2.0},
                
                # Phase 2: Moderate Risk (Moisture 250 -> 200, Moderate Vib)
                {"name": "MODERATE RISK (WATCH STATE)", "start_soil": 310, "end_soil": 205, "start_vib": 0.15, "end_vib": 0.38, "steps": 10, "delay": 2.0},
                
                # Phase 3: Critical Hazard (Moisture < 200, High Vib / Trigger Alert)
                {"name": "CRITICAL HAZARD BREACH (< 200)", "start_soil": 195, "end_soil": 110, "start_vib": 0.45, "end_vib": 0.92, "steps": 12, "delay": 2.0},
                
                # Phase 4: Recovery Back to Normal
                {"name": "RECOVERY & STABILIZATION", "start_soil": 120, "end_soil": 420, "start_vib": 0.80, "end_vib": 0.08, "steps": 15, "delay": 2.0},
            ]

            while True:
                for phase in phases:
                    print(f"\n==========================================")
                    print(f" PHASE START: {phase['name']}")
                    print(f"==========================================")
                    
                    steps = phase["steps"]
                    for i in range(steps):
                        # Linear interpolation between phase start and end points
                        alpha = i / max(1, (steps - 1))
                        
                        # Calculate raw values with tiny random jitter for realistic sensor readings
                        base_soil = phase["start_soil"] + alpha * (phase["end_soil"] - phase["start_soil"])
                        jitter_soil = random.randint(-4, 4)
                        soil_value = round(max(50.0, base_soil + jitter_soil), 1)

                        base_vib = phase["start_vib"] + alpha * (phase["end_vib"] - phase["start_vib"])
                        jitter_vib = random.uniform(-0.02, 0.02)
                        vib_value = round(max(0.01, min(1.0, base_vib + jitter_vib)), 2)

                        # Construct packet payload compatible with FastAPI endpoint
                        payload = {
                            "device_id": "SOIL_NODE_AIZAWL_01",
                            "risk": soil_value,       # Supported key (Soil Moisture Value)
                            "soil_value": soil_value, # Dual support key
                            "vib": vib_value,
                            "status": "CRITICAL" if soil_value < 200 else ("MODERATE" if soil_value <= 250 else "OK")
                        }

                        # Send JSON payload via WebSocket
                        await websocket.send(json.dumps(payload))
                        
                        alert_flag = "🚨 [THRESHOLD BREACH!]" if soil_value < 200 else ""
                        print(f"  [SENT] Soil Moisture: {soil_value:5.1f} | Vib: {vib_value:.2f} | Status: {payload['status']} {alert_flag}")
                        
                        await asyncio.sleep(phase["delay"])

    except websockets.exceptions.ConnectionRefusedError:
        print("❌ Could not connect to FastAPI server. Ensure main.py is running on port 8000.", file=sys.stderr)
    except websockets.exceptions.ConnectionClosed:
        print("⚠️ WebSocket connection closed by server.")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_soil_sensor())