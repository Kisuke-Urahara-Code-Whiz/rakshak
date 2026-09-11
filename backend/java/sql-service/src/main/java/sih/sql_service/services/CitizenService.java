package sih.sql_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sih.sql_service.dtos.CitizenContactDto;
import sih.sql_service.dtos.CitizenLanguageUpdateDto;
import sih.sql_service.dtos.CitizenLocationDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.repositories.CitizenRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final SmsFeignClient smsFeignClient;

    private static final Set<String> SUPPORTED_LANGS = Set.of(
            "en", "hi", "as", "bn", "ne", "mni", "lus", "kha", "gar"
    );

    @Transactional
    public String processLocation(CitizenLocationDto dto) {
        Optional<Citizen> citizenOptional = citizenRepository.findById(dto.getNumber());

        if (citizenOptional.isPresent()) {
            Citizen citizen = citizenOptional.get();
            citizen.setLatitude(dto.getLat());
            citizen.setLongitude(dto.getLon());
            citizen.setLastUpdatedAt(dto.getLastUpdatedAt() != null ? dto.getLastUpdatedAt() : LocalDateTime.now());
            citizenRepository.save(citizen);

            log.info("Updated coordinates for existing citizen: {}", dto.getNumber());
            return citizen.getLang();
        }

        String defaultLang = "en";
        Citizen newCitizen = Citizen.builder()
                .number(dto.getNumber())
                .latitude(dto.getLat())
                .longitude(dto.getLon())
                .lang(defaultLang)
                .lastUpdatedAt(dto.getLastUpdatedAt() != null ? dto.getLastUpdatedAt() : LocalDateTime.now())
                .build();

        citizenRepository.save(newCitizen);
        log.info("Inserted new citizen: {} with default lang: {}", dto.getNumber(), defaultLang);

        return defaultLang;
    }

    @Transactional
    public String updateLanguage(CitizenLanguageUpdateDto dto) {
        if (dto.getLang() == null || !SUPPORTED_LANGS.contains(dto.getLang().trim().toLowerCase())) {
            throw new IllegalArgumentException("Unsupported or invalid language code: " + dto.getLang());
        }

        String normalizedLang = dto.getLang().trim().toLowerCase();

        Citizen citizen = citizenRepository.findById(dto.getNumber())
                .orElseGet(() -> Citizen.builder()
                        .number(dto.getNumber())
                        .latitude(0.0)
                        .longitude(0.0)
                        .lastUpdatedAt(LocalDateTime.now())
                        .build());

        citizen.setLang(normalizedLang);
        citizenRepository.save(citizen);
        log.info("Updated language for citizen {}: {}", dto.getNumber(), normalizedLang);

        boolean isNewUser = dto.getUserType() != null && "NEW".equalsIgnoreCase(dto.getUserType().trim());
        if (isNewUser) {
            try {
                CitizenContactDto contactDto = CitizenContactDto.builder()
                        .number(String.valueOf(citizen.getNumber()))
                        .lang(normalizedLang)
                        .build();

                smsFeignClient.sendSms(contactDto);
                log.info("Sent welcome SMS to new citizen: {} in lang: {}", dto.getNumber(), normalizedLang);
            } catch (Exception ex) {
                log.error("Failed to send welcome SMS to {}: {}", dto.getNumber(), ex.getMessage());
            }
        }

        return citizen.getLang();
    }

    @Transactional(readOnly = true)
    public List<CitizenContactDto> getAllNumbersWithLang() {
        return citizenRepository.findAllNumbersWithLang();
    }
}