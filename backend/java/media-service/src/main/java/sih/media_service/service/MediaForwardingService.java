package sih.media_service.service;

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
            return ResponseEntity.ok("Metadata persisted successfully: " + sqlResponse);
        } catch (Exception ex) {
            log.error("Failed to persist upload metadata via sql-service Feign: {}", ex.getMessage());
            throw new RuntimeException("Database metadata persistence failed", ex);
        }
    }
}