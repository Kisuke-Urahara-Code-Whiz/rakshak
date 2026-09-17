================================================================================
               CENTRAL REVERSE PROXY & TUNNEL GATEWAY SETUP
================================================================================

OVERVIEW
--------------------------------------------------------------------------------
This system configures Nginx as a central reverse proxy managing three distinct
network entry points to isolate standard Web/SMS/STOMP traffic from high-frequency
ESP32-S3 IoT WebSocket traffic:

  * Port 5001 : Gateway Service + Path Translator (/risk/ws/... -> 5003/ws/...)
  * Port 5002 : Static Ngrok Tunnel (Handles SMS, STOMP server, Web hooks)
  * Port 5003 : Dynamic Pinggy Tunnel (Dedicated bidirectional IoT pipe)


--------------------------------------------------------------------------------
1. ARCHITECTURE & BIDIRECTIONAL FLOW
--------------------------------------------------------------------------------

+------------------+         +--------------------+         +-----------------------+
|  External Source |  ---->  | Nginx Reverse Proxy|  ---->  |    Internal Target    |
+------------------+         +--------------------+         +-----------------------+
| Ngrok Domain     |  ---->  | Port 5002          |  ---->  | Gateway (127.0.0.1:5001)
| Pinggy SSH       |  ---->  | Port 5003          |  ---->  | Gateway (127.0.0.1:5001)
| Local Gateway    |  ---->  | 5001/risk/ws/...   |  ---->  | 127.0.0.1:5003/ws/... |
+------------------+         +--------------------+         +-----------------------+

DATA PATH TRANSLATION (ESP32 <-> Gateway):
  1. Pinggy URL: https://xyz.run.pinggy-free.link/ws/esp/device_1
  2. Pinggy Tunnel forwards request to local machine on Port 5003.
  3. Internal request hit on `http://localhost:5001/risk/ws/esp/device_1`:
     Nginx strips `/risk` -> proxies to `http://localhost:5003/ws/esp/device_1`.
  4. Full-duplex WebSocket established (2-Way realtime communication active).


--------------------------------------------------------------------------------
2. STEP-BY-STEP EXECUTION ORDER
--------------------------------------------------------------------------------

STEP 1: Start Main Gateway Application
  Ensure your primary backend process is running and bound to port 5001.
  $ python server.py  # or node server.js

STEP 2: Start / Reload Nginx Reverse Proxy
  Load the provided `nginx.conf` file to initialize port listening rules.
  $ nginx -s reload

STEP 3: Start Ngrok Static Tunnel (Port 5002)
  Forward public domain requests to Nginx Port 5002:
  $ ngrok http 5002

STEP 4: Run Pinggy Spawner Script (`dev.py`)
  Launches the background Pinggy SSH tunnel on Port 5003 and synchronizes
  the captured dynamic URL with Vercel every 3 minutes:
  $ python dev.py


--------------------------------------------------------------------------------
3. VERIFICATION & TESTING
--------------------------------------------------------------------------------

  * Local Gateway Check:
      curl http://localhost:5001/

  * Ngrok Channel Check:
      curl http://localhost:5002/

  * Pinggy Endpoint Verification:
      curl https://iotserver-mauve.vercel.app/getESPService

  * 2-Way WebSocket Translation Test:
      ws://localhost:5001/risk/ws/esp/device_1
================================================================================