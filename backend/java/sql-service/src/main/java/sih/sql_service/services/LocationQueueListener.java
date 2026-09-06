package sih.sql_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sih.sql_service.dtos.CitizenLocationDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.repositories.CitizenRepository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationQueueListener {

    private final CitizenRepository citizenRepository;

    @RabbitListener(
            queues = "${rabbitmq.queue.location}",
            containerFactory = "batchListenerContainerFactory"
    )
    @Transactional
    public void consumeLocationBatch(List<CitizenLocationDto> batch) {
        if (batch == null || batch.isEmpty()) {
            return;
        }

        log.info("Processing location batch. Received size: {}", batch.size());

        Map<Long, Citizen> deduplicated = new LinkedHashMap<>();
        for (CitizenLocationDto dto : batch) {
            deduplicated.put(
                    dto.getNumber(),
                    Citizen.builder()
                            .number(dto.getNumber())
                            .latitude(dto.getLat())
                            .longitude(dto.getLon())
                            .build()
            );
        }

        citizenRepository.saveAll(new ArrayList<>(deduplicated.values()));
        log.info("Persisted {} citizen location updates to DB.", deduplicated.size());
    }
}