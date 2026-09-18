# RAKSHAK Complete System & API Verification Guide

This guide details all microservices, API routes, WebSocket endpoints, role-based credentials, and step-by-step procedures to test the full end-to-end integration between the **Mobile App (`user/`)**, **Web Authorities Portal (`admin/`)**, and the **Java Microservices Backend (`backend/java/`)**.

---

## 1. Network Topology & Environment Port Allocation

| Component | Container Port | Host Port | Protocol | Description |
|---|---|---|---|---|
| **Spring Cloud Gateway** | `5001` | `5001` | HTTP / WS | Central API entrypoint & reverse proxy (`/sql/**`, `/media/**`, `/room/**`) |
| **Eureka Discovery Service** | `5000` | `5000` | HTTP | Service registry for all microservices |
| **Media Service** | `5000` | `5002` | HTTP / SSE | Media file persistence (`/app/uploads`), physical file serving, SSE streams |
| **SQL Service** | `5000` | `5003` | HTTP | PostgreSQL persistence for citizens, employees, uploads, and telemetry |
| **Room Service** | `5000` | `5004` | HTTP / WS / STOMP | Real-time WebSocket alerts (`/ws/alerts`), STOMP (`/topic/risk`), tactical escalations |
| **PostgreSQL** | `5432` | `9000` | TCP | Relational database (`rakshak` DB) |
| **Web Admin Portal** | `5173` | `5173` | HTTP | Vite React administration dashboard |
| **Mobile App (Expo)** | `8081` | `8081` | HTTP / Metro | React Native mobile application for Citizens & Officials |

---

## 2. Seed Accounts & Credentials

The system supports **dual-role authentication** with pre-seeded accounts:

### Official Authorities (Clearance Level: HIGH)
| Employee ID | Default Password | Role | Jurisdiction | Department |
|---|---|---|---|---|
| `EMP-NER-001` | `admin` | `MDoNER Employee` | North Eastern Region (Central) | Disaster Risk Division |
| `ZONAL-SK-01` | `admin` | `Zonal Admin` | Sikkim Zone | Geotechnical Assessment Cell |
| `DIST-SK-NORTH` | `admin` | `District Admin` | North Sikkim District | District Emergency Operations |
| `EMP-SDRF-09` | `admin` | `MDoNER Employee` | Tactical Field Sector 9 | State Disaster Response Force |

* **Authority Capabilities**:
  * Sees **ALL** field evidence uploads from all users across the region.
  * Can access `Stations`, `Reports`, `Risk Map`, `Alerts`, and `Uploads`.
  * Can export official Incident Dossiers (`.txt`).
  * Can trigger tactical escalations from mobile phone or web.

### Civilian Observers (Clearance Level: PUBLIC)
| Phone Number | Password | Role | Capabilities |
|---|---|---|---|
| `9832041182` | *(None / OTP)* | `Citizen` | Sees **ONLY THEIR OWN** uploads. Can dispatch field evidence (photo/audio) and refresh GPS. Restricted from confidential engineering stations and reports. |
| Any 10-digit number | *(None / OTP)* | `Citizen` | Dynamically auto-registered in PostgreSQL upon login. |

---

## 3. Core API Endpoints & Routes Reference

### A. Authentication & Roles (`sql-service`)
* `POST /sql/auth/login` (via Gateway: `http://localhost:5001/sql/auth/login`)
* Direct: `http://localhost:5003/auth/login`

#### 1. Official Staff Login (MDoNER Employee)
```bash
curl -X POST http://localhost:5001/sql/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MDoNER Employee",
    "identifier": "EMP-NER-001",
    "password": "admin"
  }'
```
*Expected Response (200 OK):*
```json
{
  "status": "SUCCESS",
  "token": "OFFICIAL-SESSION-TOKEN",
  "role": "MDoNER Employee",
  "identifier": "EMP-NER-001",
  "name": "MDoNER Central Command (EMP-NER-001)",
  "department": "NER Geotechnical Cell",
  "district": "North Sikkim",
  "state": "Sikkim"
}
```

#### 2. Citizen Login (Auto-Registration & GPS Binding)
```bash
curl -X POST http://localhost:5001/sql/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Citizen",
    "identifier": "9832041182",
    "latitude": 27.6328,
    "longitude": 88.9482
  }'
```
*Expected Response (200 OK):*
```json
{
  "status": "SUCCESS",
  "token": "CITIZEN-SESSION-TOKEN",
  "role": "Citizen",
  "identifier": "9832041182",
  "name": "Citizen (9832041182)",
  "department": "Citizen Triage Node (RAKSHAK SDRF)"
}
```

---

### B. Media Ingestion & File Serving (`media-service`)

#### 1. Upload Field Evidence (Photo / Voice Memo)
* `POST /media/upload` (via Gateway: `http://localhost:5001/media/upload`)
```bash
curl -X POST http://localhost:5001/media/upload \
  -F "file=@sample_crack.jpg;type=image/jpeg" \
  -F "number=9832041182" \
  -F "fileType=JPG" \
  -F "date=2026-09-18" \
  -F "time=14:30:00" \
  -F "lat=27.6328" \
  -F "lon=88.9482"
```

#### 2. Retrieve Persisted Media File
* `GET /media/files/{filename}` (via Gateway: `http://localhost:5001/media/files/{filename}`)
```bash
curl -I http://localhost:5001/media/files/2026-09-18_14-30-00_27.6328_88.9482_9832041182.jpg
```
*Expected Response:* `200 OK` with header `Content-Type: image/jpeg` or `audio/m4a`.

#### 3. Real-Time Server-Sent Events (SSE) Stream
* `GET http://localhost:5001/media/sse/image`
* `GET http://localhost:5001/media/sse/audio`

---

### C. Ground Incident Uploads & Role Filtering (`sql-service`)

#### 1. Authorities View: Fetch ALL Field Uploads
```bash
curl -X GET http://localhost:5001/sql/uploads
```
*Returns all uploads across all reporters.*

#### 2. Citizen View: Fetch ONLY Citizen's Own Uploads
```bash
curl -X GET "http://localhost:5001/sql/uploads?number=9832041182"
```
*Returns strictly uploads submitted by `9832041182`.*

---

### D. Real-Time Alerts & Tactical Escalations (`room-service`)

#### 1. Broadcast Tactical Escalation Alert (MDoNER Mobile App or Authority)
* `POST /room/alert` (via Gateway: `http://localhost:5001/room/alert`)
* Direct: `http://localhost:5004/alert`
```bash
curl -X POST http://localhost:5001/room/alert \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```
*Expected Behavior:*
1. Broadcasts the standard `KIOSK_ALERT_EVENT` JSON to all raw WebSocket clients (`ws://localhost:5004/ws/alerts`).
2. Broadcasts the risk percentage (`95`) to all STOMP mobile clients (`/topic/risk`).
3. Web Admin portal immediately sounds the alarm, displays the alert dossier, highlights the Risk Map hazard polygon in red, and flashes the marquee.

#### 2. Raw WebSocket Endpoint for Web Authorities Dashboard
* Direct URL: `ws://localhost:5004/ws/alerts`
* Gateway URL: `ws://localhost:5001/room/ws/alerts`

You can test this endpoint using `wscat` or a WebSocket client:
```bash
npx -y wscat -c ws://localhost:5004/ws/alerts
```
When connected, sending a message to `POST /room/alert` will instantly deliver the JSON payload to the console:
```json
{
  "type": "KIOSK_ALERT_EVENT",
  "timestamp": "2026-09-18T14:30:00Z",
  "message": "CRITICAL TACTICAL ESCALATION: ...",
  "kiosk": {
    "id": "KIO-SK-OFFICIAL-123",
    "name": "Tactical Command (Officer Sharma)",
    "district": "North Sikkim",
    "state": "Sikkim",
    "elevation": "2,480m",
    "status": "Warning",
    "riskLevel": "High"
  },
  "hazardUpdate": {
    "parameter": "landslide",
    "regionName": "North Sikkim",
    "displayLevel": "High"
  }
}
```

---

## 4. End-to-End Functional Test Scenarios

### Scenario 1: Mobile Field Photo Upload -> Real-Time Authorities Feed
1. Open the **User App** on mobile / emulator (`npm run start` in `user/`).
2. Login as Citizen using phone number `9832041182`.
3. In the **Visual Evidence** card, tap **Open Camera** and take a photo (or attach an asset).
4. Tap **Transmit Visual Evidence**.
5. Open the **Web Admin Portal** on `http://localhost:5173/app/uploads`.
6. Login as an official (`EMP-NER-001` / `admin`).
7. **Verification**: Within 2 seconds (or instantly via SSE/WS), the newly uploaded photo appears in the table with phone number `+91 98320 41182`, GPS coordinates, and preview thumbnail. Click the thumbnail to inspect the full-resolution image.

---

### Scenario 2: Role-Based Upload Privacy (Citizen vs Authority)
1. In Web Admin, logout and login as a Citizen with phone `9832041182`.
2. Navigate to `http://localhost:5173/app/uploads`.
3. **Verification**: The table shows **only** uploads submitted by `9832041182`. Uploads from other citizens are not visible.
4. Logout and login as `EMP-NER-001` (MDoNER Employee).
5. Navigate back to `Uploads`.
6. **Verification**: The table shows **all** uploads from all citizens across the region.

---

### Scenario 3: MDoNER Mobile Phone Escalation -> Instant Real-Time Siren & Web Alert
1. In the **User App**, logout and switch role to **MDoNER Employee**.
2. Enter Employee ID `EMP-NER-001` and Password `admin`.
3. Tap **Authenticate Operational Node**.
4. The screen loads with the red **Official Tactical Field Command** header showing employee clearance.
5. Tap **🚨 Escalate Alert**.
6. Have the **Web Admin Portal** open on any screen (e.g. `Alerts` or `Risk Map`).
7. **Verification**:
   - Audio beep begins pulsing.
   - The Alerts screen switches from "STANDBY" to the emergency broadcast view with `TowerBroadcastCard` and SMS logs.
   - Top marquee rolls the emergency warning across all screens.
   - Risk Map marks North Sikkim in red "High Risk".

---

### Scenario 4: Multilingual Regional Script Switching
1. **In Mobile App**:
   - On the top horizontal strip, tap `অসমীয়া`, `বাংলা`, or `हिंदी`.
   - The vulnerability card, coordinates title, and action buttons immediately change into the selected regional language.
2. **In Web Admin**:
   - In the top navbar, click the language dropdown (`🌐 ENG`).
   - Select `HIN (हिंदी)`, `ASM (অসমীয়া)`, or `BEN (বাংলা)`.
   - Navigation links, status badges, and page titles reactively translate into the regional language.
