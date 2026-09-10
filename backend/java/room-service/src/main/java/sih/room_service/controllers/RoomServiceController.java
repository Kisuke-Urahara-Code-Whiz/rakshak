package sih.room_service.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import sih.room_service.dtos.RiskAlertMessage;
import sih.room_service.services.RoomService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RoomServiceController {

    private final RoomService roomService;

    @MessageMapping("/risk")
    public void handleIncomingRisk(@Payload RiskAlertMessage message) {
        log.info("Received manual risk update from client: {}", message.getRiskPercentage());
        roomService.broadcastRisk(message.getRiskPercentage());
    }
}