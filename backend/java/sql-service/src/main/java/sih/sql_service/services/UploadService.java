package sih.sql_service.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final CitizenRepository citizenRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                .questionnaire(dto.getQuestionnaire())
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

        UploadResponseDto.GroundQuestionnaire questionnaireDto = null;
        if (u.getQuestionnaire() != null && !u.getQuestionnaire().isBlank()) {
            try {
                JsonNode node = objectMapper.readTree(u.getQuestionnaire());
                if (node.isTextual()) {
                    try {
                        node = objectMapper.readTree(node.asText());
                    } catch (Exception ignored) {}
                }
                List<String> indicators = new ArrayList<>();
                if (node.has("warningIndicators") && node.get("warningIndicators").isArray()) {
                    node.get("warningIndicators").forEach(item -> indicators.add(item.asText()));
                }
                List<String> infra = new ArrayList<>();
                if (node.has("infrastructureThreatened") && node.get("infrastructureThreatened").isArray()) {
                    node.get("infrastructureThreatened").forEach(item -> infra.add(item.asText()));
                }
                boolean immediateEvac = node.has("immediateEvacuationNeeded") && node.get("immediateEvacuationNeeded").asBoolean();

                questionnaireDto = UploadResponseDto.GroundQuestionnaire.builder()
                        .activityStatus(node.has("activityStatus") ? node.get("activityStatus").asText() : "Field Evidence Logged")
                        .weatherCondition(node.has("weatherCondition") ? node.get("weatherCondition").asText() : "Monsoon Rain")
                        .warningIndicators(indicators.isEmpty() ? List.of("Mobile Telemetry Report") : indicators)
                        .infrastructureThreatened(infra.isEmpty() ? List.of("Local hillside corridor") : infra)
                        .urgencyLevel(node.has("urgencyLevel") ? node.get("urgencyLevel").asText() : "High")
                        .immediateEvacuationNeeded(immediateEvac)
                        .additionalNotes(node.has("additionalNotes") ? node.get("additionalNotes").asText() : "")
                        .build();
            } catch (Exception ex) {
                log.warn("Could not parse questionnaire JSON for upload {}: {}", u.getId(), ex.getMessage());
            }
        }

        if (questionnaireDto == null) {
            questionnaireDto = UploadResponseDto.GroundQuestionnaire.builder()
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
                    .build();
        }

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
                .severity(questionnaireDto.getImmediateEvacuationNeeded() ? "Critical" : "High")
                .groundQuestionnaire(questionnaireDto)
                .questionnaire(u.getQuestionnaire())
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