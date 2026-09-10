package sih.sql_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sih.sql_service.dtos.CitizenLocationDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.repositories.CitizenRepository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final SmsFeignClient smsFeignClient;

    @Transactional
    public String processLocation(CitizenLocationDto dto) {
        Optional<Citizen> citizenOptional = citizenRepository.findById(dto.getNumber());

        if (citizenOptional.isPresent()) {
            Citizen citizen = citizenOptional.get();
            citizen.setLatitude(dto.getLat());
            citizen.setLongitude(dto.getLon());
            citizen.setLastUpdatedAt(dto.getLastUpdatedAt());
            citizenRepository.save(citizen);
            log.info("Updated coordinates for citizen: {}", dto.getNumber());
        } else {
            Citizen newCitizen = Citizen.builder()
                    .number(dto.getNumber())
                    .latitude(dto.getLat())
                    .longitude(dto.getLon())
                    .lastUpdatedAt(dto.getLastUpdatedAt())
                    .build();
            citizenRepository.save(newCitizen);
            log.info("Inserted new citizen: {}", dto.getNumber());

            try {
                smsFeignClient.sendSms(String.valueOf(dto.getNumber()));
            } catch (Exception ex) {
                log.error("Failed to send SMS to {}: {}", dto.getNumber(), ex.getMessage());
            }
        }

        return "ok";
    }

    @Transactional(readOnly = true)
    public List<String> getAllNumbers() {
        return citizenRepository.findAllNumbersAsString();
    }
}