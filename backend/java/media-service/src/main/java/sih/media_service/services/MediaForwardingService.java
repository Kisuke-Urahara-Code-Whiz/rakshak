package sih.media_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import sih.media_service.dtos.FileUploadRequestDto;
import sih.media_service.dtos.UploadDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaForwardingService {

    private final SqlServiceClient sqlServiceClient;
    private final SseManagerService sseManagerService;

    public ResponseEntity<String> processAndForward(FileUploadRequestDto requestDto) {

        UploadDto sqlDto = UploadDto.builder()
                .number(requestDto.getNumber())
                .fileType(requestDto.getFileType())
                .date(requestDto.getDate())
                .lat(requestDto.getLat())
                .lon(requestDto.getLon())
                .time(requestDto.getTime())
                .build();

        try {
            String sqlResponse = sqlServiceClient.saveUploadRecord(sqlDto);
            log.info("Persisted metadata to sql-service: {}", sqlResponse);
        } catch (Exception ex) {
            log.error("Failed to persist upload metadata via sql-service Feign: {}", ex.getMessage());
            throw new RuntimeException("Database metadata persistence failed", ex);
        }

        try {
            byte[] fileBytes = requestDto.getFile().getBytes();

            String typeIndicator = "";
            if (requestDto.getFileType() != null) {
                typeIndicator += requestDto.getFileType().toLowerCase();
            }
            if (requestDto.getFile() != null && requestDto.getFile().getOriginalFilename() != null) {
                typeIndicator += " " + requestDto.getFile().getOriginalFilename().toLowerCase();
            }

            if (typeIndicator.contains("m4a") || typeIndicator.contains("audio")) {
                sseManagerService.broadcastAudio(fileBytes, requestDto.getLat(), requestDto.getLon());
                log.info("Broadcasted .m4a audio to SSE clients.");
            } else {
                sseManagerService.broadcastImage(fileBytes, requestDto.getLat(), requestDto.getLon());
                log.info("Broadcasted .jpeg image to SSE clients.");
            }

            return ResponseEntity.ok("File uploaded and forwarded via SSE successfully.");
        } catch (Exception ex) {
            log.error("Failed to read file bytes or send via SSE: {}", ex.getMessage());
            throw new RuntimeException("File processing failed", ex);
        }
    }
}