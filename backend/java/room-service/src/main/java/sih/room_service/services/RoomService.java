package sih.room_service.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sih.room_service.dtos.OfficialEscalationRequestDto;
import sih.room_service.dtos.RiskAlertMessage;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RawAlertWebSocketHandler rawAlertWebSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static final String BROADCAST_TOPIC = "/topic/risk";
    private static final java.util.concurrent.atomic.AtomicLong LAST_AUTO_ALERT_TIME = new java.util.concurrent.atomic.AtomicLong(0);

    public void broadcastRisk(String riskValue) {
        RiskAlertMessage payload = new RiskAlertMessage(riskValue);
        messagingTemplate.convertAndSend(BROADCAST_TOPIC, payload);
        log.info("Broadcasted risk value [{}] to topic {}", riskValue, BROADCAST_TOPIC);

        // If risk is critical (>= 85%), automatically trigger official escalation alert for Unakoti ADM5-Node 85
        try {
            double riskNum = Double.parseDouble(riskValue);
            if (riskNum >= 85.0) {
                long now = System.currentTimeMillis();
                long last = LAST_AUTO_ALERT_TIME.get();
                if (now - last > 60_000L && LAST_AUTO_ALERT_TIME.compareAndSet(last, now)) {
                    log.warn("Critical risk detected ({}%). Auto-dispatching official alert for Unakoti ADM5-Node 85", riskNum);
                    OfficialEscalationRequestDto autoDto = OfficialEscalationRequestDto.builder()
                            .district("Unakoti")
                            .state("Tripura")
                            .latitude(23.7548)
                            .longitude(92.4273)
                            .riskScore((int) Math.round(riskNum))
                            .userName("IoT Automated Station")
                            .role("Automated Telemetry Sensor")
                            .message(String.format("CRITICAL TACTICAL ALERT: Landslide risk critical (%s%%). Automated evacuation warning for Unakoti, Tripura (Node 85).", riskValue))
                            .build();
                    broadcastOfficialEscalationInternal(autoDto, false);
                }
            }
        } catch (Exception ignored) {
        }
    }

    public Map<String, Object> broadcastOfficialEscalation(OfficialEscalationRequestDto dto) {
        return broadcastOfficialEscalationInternal(dto, true);
    }

    private Map<String, Object> broadcastOfficialEscalationInternal(OfficialEscalationRequestDto dto, boolean broadcastBackToRiskTopic) {
        String district = (dto.getDistrict() != null && !dto.getDistrict().isBlank()) ? dto.getDistrict() : "Unakoti";
        String state = (dto.getState() != null && !dto.getState().isBlank()) ? dto.getState() : "Tripura";
        double lat = dto.getLatitude() != null ? dto.getLatitude() : 23.7548;
        double lon = dto.getLongitude() != null ? dto.getLongitude() : 92.4273;
        int riskScore = dto.getRiskScore() != null ? dto.getRiskScore() : 92;
        String sender = (dto.getUserName() != null ? dto.getUserName() : (dto.getEmployeeId() != null ? dto.getEmployeeId() : "IoT Node 85"));
        String role = dto.getRole() != null ? dto.getRole() : "Automated Sensor Post";

        String message = dto.getMessage() != null && !dto.getMessage().isBlank()
                ? dto.getMessage()
                : String.format("CRITICAL TACTICAL ESCALATION: Severe landslide risk & pore-pressure saturation detected at Unakoti ADM5-Node 85 (%s, %s). Evacuation protocol active.", district, state);

        Map<String, Object> coordinates = Map.of(
                "lat", lat,
                "lng", lon
        );

        Map<String, Object> kiosk = new HashMap<>();
        kiosk.put("id", "KIO-TR-085");
        kiosk.put("name", "Unakoti ADM5-Node 85");
        kiosk.put("district", district);
        kiosk.put("state", state);
        kiosk.put("subDivision", "Unakoti Sub-Division");
        kiosk.put("adm5", "Locality Block 85 - Unakoti");
        kiosk.put("elevation", "680m");
        kiosk.put("coordinates", coordinates);
        kiosk.put("lat", lat);
        kiosk.put("lng", lon);
        kiosk.put("status", "Warning");
        kiosk.put("riskLevel", "High");
        kiosk.put("type", "Seismic & Wind Sensor Post");
        kiosk.put("sensorsActive", 4);
        kiosk.put("reportedBy", sender);
        kiosk.put("operatorRole", role);

        Map<String, Object> hazardUpdate = Map.of(
                "parameter", "landslide",
                "regionName", district,
                "displayLevel", "High"
        );

        Map<String, Object> alertEvent = new HashMap<>();
        alertEvent.put("type", "KIOSK_ALERT_EVENT");
        alertEvent.put("timestamp", Instant.now().toString());
        alertEvent.put("message", message);
        alertEvent.put("kiosk", kiosk);
        alertEvent.put("hazardUpdate", hazardUpdate);

        try {
            String jsonString = objectMapper.writeValueAsString(alertEvent);

            // 1. Broadcast to all Web Admin raw WebSocket clients (Alerts page & RiskMap)
            rawAlertWebSocketHandler.broadcast(jsonString);

            // 2. Broadcast to all STOMP mobile subscribers
            if (broadcastBackToRiskTopic) {
                RiskAlertMessage payload = new RiskAlertMessage(String.valueOf(riskScore));
                messagingTemplate.convertAndSend(BROADCAST_TOPIC, payload);
            }

            log.info("Successfully dispatched live real-time official alert for kiosk: Unakoti ADM5-Node 85 ({}, {})", district, state);
        } catch (Exception e) {
            log.error("Failed to serialize or broadcast official alert: {}", e.getMessage());
        }

        return alertEvent;
    }

    public void broadcastUploadEvent(Map<String, Object> uploadData) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "UPLOAD_EVENT");
        event.put("timestamp", Instant.now().toString());
        event.put("upload", uploadData);

        try {
            String json = objectMapper.writeValueAsString(event);
            rawAlertWebSocketHandler.broadcast(json);
            log.info("Broadcasted UPLOAD_EVENT to web raw WebSocket clients");
        } catch (Exception e) {
            log.error("Failed to broadcast UPLOAD_EVENT: {}", e.getMessage());
        }
    }
}