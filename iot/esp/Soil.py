import asyncio
import json
import random

import websockets


# ============================================================
# CONFIGURATION
# ============================================================

SERVER_URL = "ws://127.0.0.1:8000/ws/soil/soil-manager-01"

# Send one reading approximately every 300 ms
SEND_INTERVAL = 0.300

# Risk threshold
RISK_THRESHOLD = 200


# ============================================================
# MOCK RISK VALUES
# ============================================================

# These values simulate readings coming from the real
# Soil Manager through Serial COM.

MOCK_RISK_VALUES = [
    650,
    630,
    610,
    590,
    570,
    550,
    530,
    510,
    480,
    450,
    420,
    390,
    350,
    320,
    280,
    250,
    220,
    210,
    195,    # ALERT
    180,    # ALERT
    165,    # ALERT
    150,    # ALERT
    220,
    250,
    300,
    350,
]


# ============================================================
# SOIL MANAGER CLIENT
# ============================================================

async def soil_manager():

    print("=" * 55)
    print("       SOIL MANAGER MOCKUP CLIENT")
    print("=" * 55)

    print(f"Server : {SERVER_URL}")
    print(f"Interval : {SEND_INTERVAL * 1000:.0f} ms")
    print(f"Alert threshold : Risk < {RISK_THRESHOLD}")
    print("=" * 55)

    try:

        async with websockets.connect(SERVER_URL) as websocket:

            print("[WS] Connected to server")
            print()

            # ------------------------------------------------
            # Continuously send soil risk values
            # ------------------------------------------------

            index = 0

            while True:

                # Get mock value
                risk_value = MOCK_RISK_VALUES[
                    index % len(MOCK_RISK_VALUES)
                ]

                index += 1

                # ------------------------------------------------
                # Create JSON packet
                # ------------------------------------------------

                data = {
                    "type": "SOIL_DATA",
                    "risk": risk_value
                }

                message = json.dumps(data)

                # ------------------------------------------------
                # Send to server
                # ------------------------------------------------

                await websocket.send(message)

                # ------------------------------------------------
                # Display status
                # ------------------------------------------------

                if risk_value < RISK_THRESHOLD:

                    print(
                        f"[SOIL] Risk: {risk_value:3} "
                        f"-->  BELOW THRESHOLD"
                    )

                else:

                    print(
                        f"[SOIL] Risk: {risk_value:3}"
                    )

                # ------------------------------------------------
                # Receive server ACK
                # ------------------------------------------------

                try:

                    response = await asyncio.wait_for(
                        websocket.recv(),
                        timeout=0.1
                    )

                    print(
                        f"[SERVER] {response}"
                    )

                except asyncio.TimeoutError:
                    pass

                # ------------------------------------------------
                # Wait ~300 ms
                # ------------------------------------------------

                await asyncio.sleep(SEND_INTERVAL)

    except ConnectionRefusedError:

        print()
        print("[ERROR] Could not connect to server.")
        print("[ERROR] Make sure FastAPI server is running.")

    except websockets.exceptions.ConnectionClosed as e:

        print()
        print(
            f"[WS] Connection closed: {e}"
        )

    except KeyboardInterrupt:

        print()
        print("[SOIL] Stopped by user.")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    asyncio.run(soil_manager())