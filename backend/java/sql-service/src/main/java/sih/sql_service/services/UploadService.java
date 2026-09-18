package sih.sql_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sih.sql_service.dtos.UploadDto;
import sih.sql_service.dtos.UploadResponseDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.entities.Upload;
import sih.sql_service.repositories.CitizenRepository;
import sih.sql_service.repositories.UploadRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final CitizenRepository citizenRepository;

    @Transactional
    public String saveUpload(UploadDto dto) {

        Citizen citizen = citizenRepository.findById(dto.getNumber())
                .orElseGet(() -> {
                    Citizen c = Citizen.builder()
                            .number(dto.getNumber())
                            .latitude(dto.getLat())
                            .longitude(dto.getLon())
                            .lang("en")
                            .lastUpdatedAt(LocalDateTime.now())
                            .build();
                    return citizenRepository.save(c);
                });

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

    @Transactional(readOnly = true)
    public List<UploadResponseDto> getAllUploads() {
        List<Upload> uploads = uploadRepository.findAllByOrderByIdDesc();
        return uploads.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UploadResponseDto> getUploadsByNumber(Long number) {
        List<Upload> uploads = uploadRepository.findByNumberOrderByIdDesc(number);
        return uploads.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    private UploadResponseDto mapToResponseDto(Upload u) {
        boolean isAudio = u.getFileType() != null &&
                (u.getFileType().equalsIgnoreCase("m4a") ||
                 u.getFileType().equalsIgnoreCase("aac") ||
                 u.getFileType().toLowerCase().contains("audio"));

        String phoneStr = String.valueOf(u.getNumber());
        String formattedPhone = phoneStr.length() == 10
                ? "+91 " + phoneStr.substring(0, 5) + " " + phoneStr.substring(5)
                : "+91 " + phoneStr;

        String timeStampStr = u.getDate() + "T" + u.getTime() + "Z";
        String fileUrl = "/media/files/" + u.getFileName();

        return UploadResponseDto.builder()
                .id("UPL-MB-" + String.format("%04d", u.getId()))
                .phoneNumber(formattedPhone)
                .uploadType(isAudio ? "audio" : "photo")
                .mediaFormat(u.getFileType() != null ? u.getFileType().toLowerCase() : "jpeg")
                .fileName(u.getFileName())
                .fileSize("2.1 MB")
                .fileUrl(fileUrl)
                .timestamp(timeStampStr)
                .relativeTime("Recent Field Evidence")
                .location(UploadResponseDto.LocationInfo.builder()
                        .state("Sikkim")
                        .district("North Sikkim")
                        .locality("Mobile Ground GPS Sector")
                        .coordinates(UploadResponseDto.Coordinates.builder()
                                .lat(u.getLatitude())
                                .lng(u.getLongitude())
                                .build())
                        .build())
                .verificationStatus("Under Field Triage")
                .severity("High")
                .groundQuestionnaire(UploadResponseDto.GroundQuestionnaire.builder()
                        .activityStatus("Dispatched via Rakshak Mobile App")
                        .weatherCondition("Monsoon Slopeline Precipitation")
                        .warningIndicators(List.of(
                                "Mobile Field Sensor/Camera Evidence",
                                "Civilian GPS Node Telemetry Ping"
                        ))
                        .infrastructureThreatened(List.of("Local Access Corridor / Roadway"))
                        .urgencyLevel("High")
                        .immediateEvacuationNeeded(false)
                        .additionalNotes("Automated telemetry upload from Mobile App user.")
                        .build())
                .payload(Map.of(
                        "source", "RAKSHAK_MOBILE_APP",
                        "number", u.getNumber(),
                        "fileName", u.getFileName(),
                        "latitude", u.getLatitude(),
                        "longitude", u.getLongitude(),
                        "date", u.getDate().toString(),
                        "time", u.getTime().toString()
                ))
                .build();
    }
}