package sih.room_service.schedulers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import sih.room_service.services.RoomService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class RiskSimulationScheduler {

    private final RoomService roomService;

    @Scheduled(initialDelay = 5000, fixedRate = 60000)
    public void simulateRiskValue() {

        double randomRisk = ThreadLocalRandom.current().nextDouble(20.0, 90.0);
        String formattedValue = String.format(Locale.US, "%.1f", randomRisk);

        log.info("[SIMULATION] Dispatching periodic risk value: {}", formattedValue);
        roomService.broadcastRisk(formattedValue);
    }
}