package sih.room_service.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import sih.room_service.dtos.OfficialEscalationRequestDto;
import sih.room_service.dtos.RiskAlertMessage;
import sih.room_service.services.RoomService;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomServiceController {

    private final RoomService roomService;

    @MessageMapping("/risk")
    public void handleIncomingRisk(@Payload RiskAlertMessage message) {
        log.info("Received manual risk update from client via STOMP: {}", message.getRiskPercentage());
        roomService.broadcastRisk(message.getRiskPercentage());
    }

    @PostMapping("/alert")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> triggerOfficialAlert(@RequestBody(required = false) OfficialEscalationRequestDto requestDto) {
        OfficialEscalationRequestDto dto = requestDto != null ? requestDto : new OfficialEscalationRequestDto();
        log.info("Received official tactical escalation alert request from: {}", dto.getEmployeeId());
        Map<String, Object> event = roomService.broadcastOfficialEscalation(dto);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/upload-event")
    @ResponseBody
    public ResponseEntity<Map<String, String>> notifyUpload(@RequestBody(required = false) Map<String, Object> uploadData) {
        log.info("Received upload event notification: {}", uploadData);
        roomService.broadcastUploadEvent(uploadData != null ? uploadData : Map.of());
        return ResponseEntity.ok(Map.of("status", "upload_broadcasted"));
    }

    @GetMapping("/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getServiceStatus() {
        return ResponseEntity.ok(Map.of(
                "service", "room-service",
                "status", "UP",
                "broadcastTopic", RoomService.BROADCAST_TOPIC,
                "rawWebSocketEndpoint", "/ws/alerts"
        ));
    }
}