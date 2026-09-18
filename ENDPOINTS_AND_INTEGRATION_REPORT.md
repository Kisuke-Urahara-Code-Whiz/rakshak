# Complete Endpoints, Payloads, Protocols & Client Usage Report

This report provides a comprehensive reference of all backend endpoints across both the **Java** and **Python** microservices, including:
1. HTTP Method & URL Route (Direct & via Spring Cloud Gateway).
2. Request Payload Schema (Headers, Body, Parameters).
3. Response Payload Schema & Status Codes.
4. Protocols used (REST HTTP, STOMP, Raw WebSocket, Server-Sent Events SSE).
5. Exact client usage mapping in the **Mobile App (`user/`)** and **Web Admin Portal (`admin/`)**.

---

## 1. Spring Cloud Gateway Unified Routing Map

All microservices are reachable externally through the **Spring Cloud Gateway** (`http://localhost:5001`). The Gateway uses `StripPrefix=1` to forward traffic to the target microservices registered in Eureka:

| Gateway Route Prefix | Target Microservice | Service Language | Description |
|---|---|---|---|
| `http://localhost:5001/sql/**` | `SQL-SERVICE` (`:5000`) | Java (Spring Boot) | Authentication, Citizen GPS Telemetry, Incident Dossiers |
| `http://localhost:5001/media/**` | `MEDIA-SERVICE` (`:5000`) | Java (Spring Boot) | File uploads (Photos/Audio), disk retrieval, SSE streams |
| `http://localhost:5001/room/**` | `ROOM-SERVICE` (`:5000`) | Java (Spring Boot) | Real-time WebSocket alerts, STOMP risk topics, escalations |
| `http://localhost:5001/sms/**` | `SMS-SERVICE` (`:5000`) | Java (Spring Boot) | GSM/SMS Gateway alert broadcast |
| `http://localhost:5001/sms-test/**` | `SMS-TEST-SERVICE` (`:5000`) | Java (Spring Boot) | Diagnostic SMS broadcast |
| `http://localhost:5001/risk/**` | `RISK-ENGINE-SERVICE` (`:8000`) | Python (FastAPI) | Soil moisture analytics, GeoJSON telemetry, WAN alert |
| `http://localhost:5001/static/**` | `STATIC-LOADER-SERVICE` (`:8001`)| Python (FastAPI) | DEM Elevation, Topographic Wetness Index (TWI), Slope CSV |
| `http://localhost:5001/stomp/**` | `STOMP-SERVICE` (`:8002`) | Python (FastAPI) | Python-to-Java STOMP bridge |

---

## 2. Java Microservices: Endpoints & Contracts

### A. `sql-service` (Port: Internal `5000` / Host `5003`)

#### 1. Dual-Mode Authentication (Citizen & Officials)
* **Route**: `POST /auth/login` (Gateway: `POST /sql/auth/login`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "role": "MDoNER Employee",      // "Citizen" | "MDoNER Employee" | "Zonal Admin" | "District Admin"
    "identifier": "EMP-NER-001",    // Employee ID (e.g. EMP-NER-001) OR Phone Number (e.g. 9832041182)
    "password": "admin",            // Required for Officials (default: "admin"); optional for Citizens
    "latitude": 27.6328,            // Optional for Citizens to bind initial GPS location
    "longitude": 88.9482
  }
  ```
* **Response Payload (`200 OK`)**:
  ```json
  {
    "status": "SUCCESS",
    "token": "UUID_OR_SESSION_TOKEN",
    "role": "MDoNER Employee",
    "identifier": "EMP-NER-001",
    "name": "MDoNER Central Command (EMP-NER-001)",
    "department": "NER Geotechnical Cell",
    "district": "North Sikkim",
    "state": "Sikkim",
    "lang": "en"
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "status": "FAILED",
    "message": "Invalid credentials. Official account requires valid Employee ID and Password."
  }
  ```

#### 2. Get Available System Roles
* **Route**: `GET /auth/roles` (Gateway: `GET /sql/auth/roles`)
* **Response Payload (`200 OK`)**:
  ```json
  [
    "Citizen",
    "MDoNER Employee",
    "Zonal Admin",
    "District Admin"
  ]
  ```

#### 3. Verify Session Token
* **Route**: `GET /auth/verify?token={token}` (Gateway: `GET /sql/auth/verify?token={token}`)
* **Response Payload (`200 OK`)**:
  ```json
  {
    "valid": true,
    "timestamp": 1758200000000
  }
  ```

#### 4. Citizen Location Heartbeat / Ingestion
* **Route**: `POST /enter` (Gateway: `POST /sql/enter`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "number": 9832041182,
    "lat": 27.6328,
    "lon": 88.9482,
    "lastUpdatedAt": "2026-09-18 14:30:00"
  }
  ```
* **Response Payload (`200 OK`)**: Returns active citizen language string (e.g., `"en"`).

#### 5. Update Citizen Regional Language
* **Route**: `PUT /citizen/language` (Gateway: `PUT /sql/citizen/language`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "number": 9832041182,
    "lang": "as",                   // "en" | "hi" | "as" | "bn" | "ne" | "mni" | "lus" | "kha" | "gar"
    "userType": "OLD"               // "NEW" (triggers welcome SMS) | "OLD"
  }
  ```
* **Response Payload (`200 OK`)**: Returns updated language string (e.g. `"as"`).

#### 6. Fetch Ground Evidence Uploads (Role Filtered)
* **Route**: `GET /uploads?number={phoneNumber}` (Gateway: `GET /sql/uploads?number={phoneNumber}`)
* **Query Parameters**:
  * `number` *(optional)*: If specified, returns strictly uploads by this citizen. If omitted, returns all uploads across all citizens (Authorities view).
* **Response Payload (`200 OK`)**:
  ```json
  [
    {
      "id": "UPL-MB-0001",
      "phoneNumber": "+91 98320 41182",
      "uploadType": "photo",           // "photo" | "audio"
      "mediaFormat": "png",
      "fileName": "2026-09-18_14-30-00_27.6328_88.9482_9832041182.png",
      "fileSize": "2.1 MB",
      "fileUrl": "/media/files/2026-09-18_14-30-00_27.6328_88.9482_9832041182.png",
      "timestamp": "2026-09-18T14:30:00Z",
      "relativeTime": "Recent Field Evidence",
      "location": {
        "state": "Sikkim",
        "district": "North Sikkim",
        "locality": "Mobile Ground GPS Sector",
        "coordinates": {
          "lat": 27.6328,
          "lng": 88.9482
        }
      },
      "verificationStatus": "Under Field Triage",
      "severity": "High",
      "groundQuestionnaire": {
        "activityStatus": "Dispatched via Rakshak Mobile App",
        "weatherCondition": "Monsoon Slopeline Precipitation",
        "warningIndicators": [
          "Mobile Field Sensor/Camera Evidence",
          "Civilian GPS Node Telemetry Ping"
        ],
        "infrastructureThreatened": [
          "Local Access Corridor / Roadway"
        ],
        "urgencyLevel": "High",
        "immediateEvacuationNeeded": false,
        "additionalNotes": "Automated telemetry upload from Mobile App user."
      },
      "payload": {
        "source": "RAKSHAK_MOBILE_APP",
        "number": 9832041182,
        "fileName": "2026-09-18_14-30-00_27.6328_88.9482_9832041182.png",
        "latitude": 27.6328,
        "longitude": 88.9482,
        "date": "2026-09-18",
        "time": "14:30:00"
      }
    }
  ]
  ```

#### 7. Direct Metadata Persistence (Internal Service-to-Service)
* **Route**: `POST /upload`
* **Request Payload**:
  ```json
  {
    "number": 9832041182,
    "fileType": "PNG",
    "date": "2026-09-18",
    "time": "14:30:00",
    "lat": 27.6328,
    "lon": 88.9482
  }
  ```
* **Response Payload (`200 OK`)**: `"ok"`

#### 8. Retrieve All Registered Citizen Contacts
* **Route**: `GET /numbers` (Gateway: `GET /sql/numbers`)
* **Response Payload (`200 OK`)**:
  ```json
  [
    {
      "number": 9832041182,
      "lang": "en"
    }
  ]
  ```

---

### B. `media-service` (Port: Internal `5000` / Host `5002`)

#### 1. Ingest Multipart Field Evidence (Photo / Voice Memo)
* **Route**: `POST /upload` (Gateway: `POST /media/upload`)
* **Headers**: `Content-Type: multipart/form-data`
* **Form-Data Fields**:
  * `file`: Binary file stream (`.png`, `.jpg`, `.jpeg`, `.m4a`, `.aac`, `.wav`)
  * `number`: Long (`9832041182`)
  * `fileType`: String (`"PNG"`, `"JPG"`, `"M4A"`)
  * `date`: String (`"2026-09-18"`)
  * `time`: String (`"14:30:00"`)
  * `lat`: String / Double (`"27.6328"`)
  * `lon`: String / Double (`"88.9482"`)
* **Processing**:
  1. Writes physical file to disk (`/app/uploads/` and local `./uploads/`).
  2. Forwards metadata to `sql-service` via Feign client.
  3. Broadcasts base64 data to SSE image/audio subscribers.
  4. Dispatches `UPLOAD_EVENT` notification to `room-service`.
* **Response Payload (`200 OK`)**:
  ```
  "File uploaded, persisted, and forwarded via SSE successfully."
  ```

#### 2. Physical File Retrieval (Image / Audio)
* **Route**: `GET /files/{filename}` (Gateway: `GET /media/files/{filename}`)
* **Response Payload (`200 OK`)**:
  * Binary file payload.
  * Headers: `Content-Type: image/png`, `image/jpeg`, `audio/m4a`, `audio/mpeg`, etc.
  * Header: `Content-Disposition: inline; filename="..."`

#### 3. Real-Time Server-Sent Events (SSE) Image Stream
* **Route**: `GET /sse/image` (Gateway: `GET /media/sse/image`)
* **Headers**: `Accept: text/event-stream`
* **SSE Event (`image-event`) Data**:
  ```json
  {
    "fileData": "base64EncodedDataString...",
    "fileType": "image/jpeg",
    "lat": 27.6328,
    "lon": 88.9482
  }
  ```

#### 4. Real-Time Server-Sent Events (SSE) Audio Stream
* **Route**: `GET /sse/audio` (Gateway: `GET /media/sse/audio`)
* **Headers**: `Accept: text/event-stream`
* **SSE Event (`audio-event`) Data**:
  ```json
  {
    "fileData": "base64EncodedDataString...",
    "fileType": "audio/m4a",
    "lat": 27.6328,
    "lon": 88.9482
  }
  ```

---

### C. `room-service` (Port: Internal `5000` / Host `5004`)

#### 1. Broadcast Tactical Escalation Alert (MDoNER Mobile App / REST)
* **Route**: `POST /alert` (Gateway: `POST /room/alert`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "employeeId": "EMP-NER-001",
    "role": "MDoNER Employee",
    "userName": "Officer Sharma",
    "department": "NER Geotechnical Cell",
    "district": "North Sikkim",
    "state": "Sikkim",
    "latitude": 27.6328,
    "longitude": 88.9482,
    "message": "CRITICAL TACTICAL ESCALATION: Siren & public evacuation engaged. Severe slope displacement imminent.",
    "riskScore": 95
  }
  ```
* **Processing**:
  1. Constructs canonical `KIOSK_ALERT_EVENT`.
  2. Broadcasts JSON payload to all connected raw WebSockets (`/ws/alerts`).
  3. Broadcasts risk percentage to all STOMP mobile subscribers on `/topic/risk`.
* **Response Payload (`200 OK`)**:
  ```json
  {
    "type": "KIOSK_ALERT_EVENT",
    "timestamp": "2026-09-18T14:30:00Z",
    "message": "CRITICAL TACTICAL ESCALATION: Siren & public evacuation engaged...",
    "kiosk": {
      "id": "KIO-SK-OFFICIAL-123",
      "name": "Tactical Command (Officer Sharma)",
      "district": "North Sikkim",
      "state": "Sikkim",
      "elevation": "2,480m",
      "coordinates": { "lat": 27.6328, "lng": 88.9482 },
      "status": "Warning",
      "riskLevel": "High",
      "type": "Official Tactical Field Command",
      "reportedBy": "Officer Sharma",
      "operatorRole": "MDoNER Employee"
    },
    "hazardUpdate": {
      "parameter": "landslide",
      "regionName": "North Sikkim",
      "displayLevel": "High"
    }
  }
  ```

#### 2. Raw WebSocket Endpoint for Web Authorities Dashboard
* **Route**: `ws://localhost:5004/ws/alerts` (Gateway: `ws://localhost:5001/room/ws/alerts`)
* **Protocol**: Plain WebSocket (`new WebSocket(...)`)
* **Frames Pushed to Client**:
  * **Alert Event**:
    ```json
    {
      "type": "KIOSK_ALERT_EVENT",
      "timestamp": "2026-09-18T14:30:00Z",
      "message": "...",
      "kiosk": { ... },
      "hazardUpdate": { ... }
    }
    ```
  * **Upload Notification Event**:
    ```json
    {
      "type": "UPLOAD_EVENT",
      "timestamp": "2026-09-18T14:30:05Z",
      "upload": {
        "fileName": "2026-09-18_14-30-00_27.6328_88.9482_9832041182.png",
        "number": 9832041182,
        "fileType": "png",
        "lat": 27.6328,
        "lon": 88.9482
      }
    }
    ```

#### 3. STOMP WebSocket Message Broker Endpoint for Mobile App
* **Route**: `ws://localhost:5004/ws` (Gateway: `ws://localhost:5001/room/ws`)
* **Protocol**: STOMP over WebSocket
* **Broker Prefix**: `/topic`
* **Application Destination Prefix**: `/app`
* **Subscribed Topic**: `/topic/risk`
* **Inbound Frame on `/topic/risk`**:
  ```json
  {
    "riskPercentage": "95"
  }
  ```
* **Client Inbound Message Destination**: `/app/risk`
  * Payload: `{"riskPercentage": "85"}`
  * Broadcasts value back to `/topic/risk`.

#### 4. Internal Upload Event Forwarding
* **Route**: `POST /upload-event`
* **Request Payload**:
  ```json
  {
    "fileName": "2026-09-18_14-30-00_27.6328_88.9482_9832041182.png",
    "number": 9832041182,
    "fileType": "png",
    "lat": 27.6328,
    "lon": 88.9482
  }
  ```
* **Response Payload (`200 OK`)**: `{"status": "upload_broadcasted"}`

#### 5. Service Diagnostic Status
* **Route**: `GET /status` (Gateway: `GET /room/status`)
* **Response Payload (`200 OK`)**:
  ```json
  {
    "service": "room-service",
    "status": "UP",
    "broadcastTopic": "/topic/risk",
    "rawWebSocketEndpoint": "/ws/alerts"
  }
  ```

---

### D. `sms-service` (Port: Internal `5000`)

#### 1. Broadcast Emergency SMS Alert
* **Route**: `POST /send-alert` (Gateway: `POST /sms/send-alert`)
* **Processing**: Fetches numbers from `sql-service` at `/numbers` and dispatches localized SMS alerts via GSM hardware device at `SMS_DEVICE_IP:SMS_DEVICE_PORT`.
* **Response Payload (`200 OK`)**: `"Alert SMS sent successfully."`

#### 2. Welcome SMS for New Citizens
* **Route**: `POST /send-welcome-sms` (Gateway: `POST /sms/send-welcome-sms`)
* **Request Payload**:
  ```json
  {
    "number": 9832041182,
    "lang": "en"
  }
  ```
* **Response Payload (`200 OK`)**: `"Welcome SMS dispatched."`

---

### E. `sms-test-service` (Port: Internal `5000`)

#### 1. Test Default Broadcast
* **Route**: `POST /broadcast-default` (Gateway: `POST /sms-test/broadcast-default`)
* **Response Payload (`200 OK`)**: String status confirmation.

#### 2. Send Custom Diagnostic SMS
* **Route**: `POST /send` (Gateway: `POST /sms-test/send`)
* **Request Payload**: Raw string text message.
* **Response Payload (`200 OK`)**: String delivery status.

---

## 3. Python Microservices: Endpoints & Contracts

### A. `risk-engine-service` (Port: Internal `8000` / Host `8000`)

#### 1. Bulk Soil Hardware Sensor Ingestion
* **Route**: `POST /api/soil/bulk` (Gateway: `POST /risk/api/soil/bulk`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  [
    {
      "sensor_id": "sensor_soil_01",
      "value": 142.5
    },
    {
      "sensor_id": "sensor_soil_02",
      "value": 280.0
    }
  ]
  ```
* **Logic & Threshold Actions**:
  * Value `< 200` represents saturated moisture $\to$ sets `risk > 90.0%`.
  * Value `200-250` $\to$ sets `risk ~69%`.
  * Value `250-350` $\to$ sets `risk ~35%`.
  * Value `> 450` $\to$ dry soil (`risk ~20%`).
  * If `val <= 150.0`: Triggers SMS alert via `sms-service:5000/send-alert`, pushes WAN alerts to devices 1 & 2, and pushes high risk (`> 85%`) to `stomp-service:8002/stompv2`.
* **Response Payload (`200 OK`)**:
  ```json
  {
    "status": "success",
    "received_count": 2
  }
  ```

#### 2. Get Recent Hardware Moisture Series
* **Route**: `GET /api/soil-series` (Gateway: `GET /risk/api/soil-series`)
* **Response Payload (`200 OK`)**:
  ```json
  {
    "latest_hardware_moisture": [116.2, 142.5, 250.0, ...]
  }
  ```

#### 3. Live Geotechnical Map Telemetry GeoJSON
* **Route**: `GET /api/live-data` (Gateway: `GET /risk/api/live-data`)
* **Response Payload (`200 OK`)**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Polygon", "coordinates": [...] },
        "properties": {
          "value": 78.4,
          "risk": 78.4,
          "rain_1h": 8.2,
          "rain_24h": 42.1,
          "rain_7d": 112.5,
          "district": "North Sikkim",
          "state": "Sikkim",
          "slide_name": "Dzongu Active Slide",
          "geomorphology": "High Relief Escarpment",
          "vegetation_cover": "Dense Sub-Tropical",
          "rainfall_trigger": "Continuous Monsoon",
          "hardware_moisture": [120.0, ...]
        }
      }
    ]
  }
  ```

#### 4. Trigger WAN Siren Alert on Field Device
* **Route**: `POST /trigger-alert` (Gateway: `POST /risk/trigger-alert`)
* **Request Payload**:
  ```json
  {
    "device_id": "device_1",
    "duration_ms": 500
  }
  ```
* **Response Payload (`200 OK`)**:
  ```json
  {
    "status": "sent",
    "device_id": "device_1",
    "duration_ms": 500
  }
  ```

#### 5. Hardware Device WebSocket Connection
* **Route**: `ws://localhost:8000/ws/{device_id}` (Gateway: `ws://localhost:5001/risk/ws/{device_id}`)
* **Protocol**: Plain WebSocket
* **Function**: Hardware nodes maintain an active connection and acknowledge alert triggers (`[device_id ACK]: ...`).

#### 6. Health Check
* **Route**: `GET /health` (Gateway: `GET /risk/health`)
* **Response Payload (`200 OK`)**: `{"status": "healthy"}`

---

### B. `static-loader-service` (Port: Internal `8001` / Host `8001`)

#### 1. Spatial DEM & Geomorphology Features by Coordinates
* **Route**: `GET /static-features?lat={lat}&llong={lng}` (Gateway: `GET /static/static-features?lat={lat}&llong={lng}`)
* **Query Parameters**:
  * `lat`: Float latitude (e.g. `27.6328`)
  * `llong`: Float longitude (e.g. `88.9482`)
* **Response Payload (`200 OK`)**:
  ```json
  {
    "max_elev_m": 2480.0,
    "mean_elev_m": 2150.4,
    "max_slope_deg": 48.2,
    "mean_slope_deg": 32.6,
    "steep_ratio": 0.68,
    "mean_aspect_deg": 142.1,
    "mean_profile_curvature": -0.042,
    "mean_plan_curvature": 0.031,
    "max_flow_accumulation": 12840.0,
    "mean_twi": 8.42
  }
  ```

#### 2. Soil Moisture Index (SPL-3 Month)
* **Route**: `GET /soil-moisture?lat={lat}&llong={lng}` (Gateway: `GET /static/soil-moisture?lat={lat}&llong={lng}`)
* **Query Parameters**: `lat`, `llong`
* **Response Payload (`200 OK`)**:
  ```json
  {
    "soil_moisture": 74.2
  }
  ```

#### 3. Health Check
* **Route**: `GET /health` (Gateway: `GET /static/health`)
* **Response Payload (`200 OK`)**: `{"status": "healthy"}`

---

### C. `stomp-service` (Port: Internal `8002` / Host `8002`)

#### 1. Bulk Risk Publishing to STOMP Broker
* **Route**: `POST /stomp` (Gateway: `POST /stomp/stomp`)
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "risks": [
      { "risk": 75.4 },
      { "risk": 82.1 }
    ]
  }
  ```
* **Processing**: Connects to `room-service:5000/ws` using STOMP protocol and publishes risk values to `/app/risk`.
* **Response Payload (`200 OK`)**:
  ```json
  {
    "status": "success",
    "items_sent": 2
  }
  ```

#### 2. Single Risk Publishing to STOMP Broker
* **Route**: `POST /stompv2` (Gateway: `POST /stomp/stompv2`)
* **Request Payload**:
  ```json
  {
    "risk": 92.5
  }
  ```
* **Response Payload (`200 OK`)**:
  ```json
  {
    "status": "success",
    "items_sent": 1
  }
  ```

#### 3. Health Check
* **Route**: `GET /health` (Gateway: `GET /stomp/health`)
* **Response Payload (`200 OK`)**: `{"status": "healthy"}`

---

## 4. Client Usage Mapping

### A. Mobile Application (`user/`)

| File / Component | Protocol | Route / Topic | Purpose & Trigger |
|---|---|---|---|
| **[telemetryApi.ts](file:///c:/Coding/sih-ps-1/user/src/services/telemetryApi.ts)** | REST HTTP POST | `${API_BASE_URL}/sql/auth/login` | Citizen mobile login & Official ID authentication. |
| **[telemetryApi.ts](file:///c:/Coding/sih-ps-1/user/src/services/telemetryApi.ts)** | REST HTTP POST | `${API_BASE_URL}/sql/enter` | Ingests latest citizen GPS coordinates (`useTelemetry.ts`). |
| **[telemetryApi.ts](file:///c:/Coding/sih-ps-1/user/src/services/telemetryApi.ts)** | REST HTTP PUT | `${API_BASE_URL}/sql/citizen/language` | Updates citizen preferred dialect (`select-language.tsx`, `settings.tsx`). |
| **[telemetryApi.ts](file:///c:/Coding/sih-ps-1/user/src/services/telemetryApi.ts)** | REST Multipart POST | `${API_BASE_URL}/media/upload` | Dispatches captured camera photo (`.jpg`/`.png`) or recorded voice memo (`.m4a`) to backend with GPS coordinates. |
| **[telemetryApi.ts](file:///c:/Coding/sih-ps-1/user/src/services/telemetryApi.ts)** | REST HTTP POST | `${API_BASE_URL}/room/alert` | Triggered by **MDoNER Employee** tapping **🚨 Escalate Alert** on [home.tsx](file:///c:/Coding/sih-ps-1/user/src/app/home.tsx). Broadcasts emergency alert to Web Admin. |
| **[useRiskWebSocket.ts](file:///c:/Coding/sih-ps-1/user/src/hooks/useRiskWebSocket.ts)** | **STOMP over WebSocket** | `ws://${WS_BASE_URL}/room/ws`<br>**Topic:** `/topic/risk` | Subscribes to real-time risk score stream. Updates Zustand store `setRiskScore()` to adjust dial indicator & trigger Level-3 evacuation warning. |

---

### B. Web Authorities Portal (`admin/`)

| File / Component | Protocol | Route / Topic | Purpose & Trigger |
|---|---|---|---|
| **[Login.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Login.jsx)** | REST HTTP POST | `${API_BASE_URL}/sql/auth/login` | Authenticates officials (`EMP-NER-001`, `ZONAL-SK-01`, etc.) or citizens. Stores role & session. |
| **[Uploads.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Uploads.jsx)** | REST HTTP GET | `${API_BASE_URL}/sql/uploads`<br>*(or `?number=...` for citizen)* | Fetches real-time field evidence submissions with 2-second polling. Strictly isolates citizen data if role is Citizen. |
| **[Uploads.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Uploads.jsx)** | **Server-Sent Events (SSE)** | `${API_BASE_URL}/media/sse/image`<br>`${API_BASE_URL}/media/sse/audio` | Zero-delay instant sync: when an asset hits `media-service`, SSE listener instantly refreshes the uploads table. |
| **[Uploads.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Uploads.jsx)** | REST HTTP POST | `${API_BASE_URL}/room/alert` | Official clicking **Escalate to System Alert** posts to `room-service` to broadcast alert. |
| **[MediaPreviewModal.jsx](file:///c:/Coding/sih-ps-1/admin/src/components/uploads/MediaPreviewModal.jsx)** | REST HTTP GET | `${API_BASE_URL}/media/files/{filename}` | Streams full-resolution physical photo or plays physical `.m4a` audio memo directly from disk storage. |
| **[Reports.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Reports.jsx)** | REST HTTP GET | `${API_BASE_URL}/sql/uploads` | Ingests real user ground submissions into incident dossiers. Generates downloadable text reports. SSE listeners enabled. |
| **[AlertContext.jsx](file:///c:/Coding/sih-ps-1/admin/src/context/AlertContext.jsx)** | **Raw WebSocket** | `ws://localhost:5004/ws/alerts`<br>*(fallback: `:5001/room/ws/alerts`)* | Subscribes to live geotechnical and tactical alerts. Inbound `KIOSK_ALERT_EVENT` triggers audio siren, updates Alert page, paints Risk Map polygon red, and scrolls emergency marquee. Inbound `UPLOAD_EVENT` triggers immediate table refresh. |
| **[Alerts.jsx](file:///c:/Coding/sih-ps-1/admin/src/pages/Alerts.jsx)** | UI Listener | State from `useAlert()` | Displays standby radar animation with connected endpoint status when idle; displays Tower Broadcast Card & SMS dispatch logs when active WebSocket alert is present. |
