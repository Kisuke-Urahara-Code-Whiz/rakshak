package sih.room_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sih.room_service.dtos.RiskAlertMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messagingTemplate;
    public static final String BROADCAST_TOPIC = "/topic/risk";

    public void broadcastRisk(String riskValue) {
        RiskAlertMessage payload = new RiskAlertMessage(riskValue);
        messagingTemplate.convertAndSend(BROADCAST_TOPIC, payload);
        log.info("Broadcasted risk value [{}] to topic {}", riskValue, BROADCAST_TOPIC);
    }
}