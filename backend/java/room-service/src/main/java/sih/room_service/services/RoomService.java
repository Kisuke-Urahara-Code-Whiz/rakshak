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

    public void broadcastRisk(String riskValue) {
        RiskAlertMessage payload = new RiskAlertMessage(riskValue);
        messagingTemplate.convertAndSend(BROADCAST_TOPIC, payload);
        log.info("Broadcasted risk value [{}] to topic {}", riskValue, BROADCAST_TOPIC);
    }

    public Map<String, Object> broadcastOfficialEscalation(OfficialEscalationRequestDto dto) {
        String district = (dto.getDistrict() != null && !dto.getDistrict().isBlank()) ? dto.getDistrict() : "North Sikkim";
        String state = (dto.getState() != null && !dto.getState().isBlank()) ? dto.getState() : "Sikkim";
        double lat = dto.getLatitude() != null ? dto.getLatitude() : 27.6328;
        double lon = dto.getLongitude() != null ? dto.getLongitude() : 88.9482;
        int riskScore = dto.getRiskScore() != null ? dto.getRiskScore() : 85;
        String sender = (dto.getUserName() != null ? dto.getUserName() : (dto.getEmployeeId() != null ? dto.getEmployeeId() : "Official Field Command"));
        String role = dto.getRole() != null ? dto.getRole() : "MDoNER Employee";

        String message = dto.getMessage() != null && !dto.getMessage().isBlank()
                ? dto.getMessage()
                : String.format("CRITICAL TACTICAL ESCALATION: Siren & public evacuation engaged by %s (%s). Severe slope displacement imminent.", sender, role);

        Map<String, Object> coordinates = Map.of(
                "lat", lat,
                "lng", lon
        );

        Map<String, Object> kiosk = new HashMap<>();
        kiosk.put("id", "KIO-SK-OFFICIAL-" + (System.currentTimeMillis() % 1000));
        kiosk.put("name", String.format("Tactical Command (%s)", sender));
        kiosk.put("district", district);
        kiosk.put("state", state);
        kiosk.put("elevation", "2,480m");
        kiosk.put("coordinates", coordinates);
        kiosk.put("status", "Warning");
        kiosk.put("riskLevel", "High");
        kiosk.put("type", "Official Tactical Field Command");
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

            // 1. Broadcast to all Web Admin raw WebSocket clients
            rawAlertWebSocketHandler.broadcast(jsonString);

            // 2. Broadcast to all STOMP mobile subscribers
            broadcastRisk(String.valueOf(riskScore));

            log.info("Successfully dispatched live real-time official alert for region: {}", district);
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