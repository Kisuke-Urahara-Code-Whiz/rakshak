import asyncio
import json
import serial
import serial.tools.list_ports
import websockets
import random

BAUD_RATE = 9600
SERVER_URL = "ws://127.0.0.1:8000/ws/soil/soil-manager-01"
RISK_THRESHOLD = 200
RECONNECT_DELAY = 3


def auto_detect_serial_port():
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        return None

    keywords = ["Arduino", "Genuino", "16U2", "CH340", "USB Serial", "FTDI"]

    for port in ports:
        for keyword in keywords:
            if keyword.lower() in port.description.lower():
                return port.device

    return ports[0].device

def trunk(val):
    risk = 90
    if val < 200:
        val = 116.0 + random.randint(-5, 3)
        risk = 91.0 + random.randint(0, 3)
    if val > 200 and val < 250:
        risk = 69.0 + random.randint(0, 6)
        val = 250 + random.randint(-25, 10)
    if val >= 250 and val < 350:
        risk = 35.0 + random.randint(-1, 6)
    if val >= 350 and val <=450:
        risk = 25.0 + random.randint(-1, 6)
    if val > 450:
        risk = 20.0 + random.randint(0, 6)
        val = 450 + random.randint(-5, 5)
    return (val,risk)

async def soil_manager():
    print("=" * 55)
    print("     SOIL MANAGER (ARDUINO UNO) CLIENT")
    print("=" * 55)
    print(f"Server          : {SERVER_URL}")
    print(f"Alert threshold : Risk < {RISK_THRESHOLD}")
    print("=" * 55)

    while True:
        port = auto_detect_serial_port()

        if not port:
            print(f"[SERIAL] No COM ports detected. Retrying in {RECONNECT_DELAY}s...")
            await asyncio.sleep(RECONNECT_DELAY)
            continue

        print(f"[SERIAL] Found device on {port}. Attempting connection...")

        ser = None
        try:
            ser = serial.Serial(port, BAUD_RATE, timeout=1)
            print(f"[SERIAL] Connected to {port}. Waiting 2s for Arduino auto-reset...")
            await asyncio.sleep(2)
        except serial.SerialException as e:
            print(f"[SERIAL] Could not open {port}: {e}")
            await asyncio.sleep(RECONNECT_DELAY)
            continue

        try:
            async with websockets.connect(SERVER_URL) as websocket:
                print("[WS] Connected to server\n")

                while True:
                    raw_line = await asyncio.to_thread(ser.readline)
                    line = raw_line.decode("utf-8", errors="ignore").strip()

                    if not line:
                        continue
                    l = line.split("|")
                    line = l[0]
                    vib = int(l[1])
                    tup = (969,96.99)
                    try:
                        risk_value = int(line)
                        tup = trunk(risk_value)
                    except ValueError:
                        print(f"[SERIAL LOG] {tup} Vib :  {vib}")
                        continue
                    if(vib==0):
                        vib = random.random()*0.10
                    if(vib==1):
                        vib = 1-random.random()*0.01
                    data = {"type": "SOIL_DATA", "risk": tup[0],"riskPercentage":tup[1],"vib":vib}
                    await websocket.send(json.dumps(data))

                    if risk_value < RISK_THRESHOLD:
                        print(f"[SOIL] Risk: {risk_value:3} --> 🚨 BELOW THRESHOLD")
                    else:
                        print(f"[SOIL] Risk: {risk_value:3} Vib : {vib}")

                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=0.01)
                        print(f"[SERVER] {response}")
                    except asyncio.TimeoutError:
                        pass

        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError, OSError) as e:
            print(f"\n[WS ERROR] Server connection lost ({e}). Reconnecting in {RECONNECT_DELAY}s...")

        except serial.SerialException as e:
            print(f"\n[SERIAL ERROR] Arduino disconnected ({e}). Rescanning in {RECONNECT_DELAY}s...")

        finally:
            if ser and ser.is_open:
                ser.close()
                print("[SERIAL] Port closed.")

        await asyncio.sleep(RECONNECT_DELAY)


if __name__ == "__main__":
    try:
        asyncio.run(soil_manager())
    except KeyboardInterrupt:
        print("\n[SOIL] Process terminated by user.")
