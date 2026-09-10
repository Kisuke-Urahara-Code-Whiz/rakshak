package sih.sql_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sih.sql_service.dtos.UploadDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.entities.Upload;
import sih.sql_service.repositories.CitizenRepository;
import sih.sql_service.repositories.UploadRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final CitizenRepository citizenRepository;

    @Transactional
    public String saveUpload(UploadDto dto) {

        Citizen citizen = citizenRepository.findById(dto.getNumber())
                .orElseThrow(() -> new RuntimeException("Citizen not registered with number: " + dto.getNumber()));

        LocalDateTime lastUpdatedAt = LocalDateTime.of(dto.getDate(), dto.getTime());
        citizen.setLatitude(dto.getLat());
        citizen.setLongitude(dto.getLon());
        citizen.setLastUpdatedAt(lastUpdatedAt);
        citizenRepository.save(citizen);
        log.info("Updated citizen location for: {}", dto.getNumber());

        String sanitizedTime = dto.getTime().toString().replace(":", "-");
        String generatedFileName = String.format("%s_%s_%s_%s_%s.%s",
                dto.getDate(),
                sanitizedTime,
                dto.getLat(),
                dto.getLon(),
                dto.getNumber(),
                dto.getFileType().toLowerCase()
        );

        Upload upload = Upload.builder()
                .number(dto.getNumber())
                .fileType(dto.getFileType())
                .date(dto.getDate())
                .latitude(dto.getLat())
                .longitude(dto.getLon())
                .time(dto.getTime())
                .fileName(generatedFileName)
                .build();

        uploadRepository.save(upload);
        log.info("Saved upload for number: {}, generated file: {}", dto.getNumber(), generatedFileName);

        return "ok";
    }
}