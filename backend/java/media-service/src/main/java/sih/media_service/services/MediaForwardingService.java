package sih.media_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import sih.media_service.dtos.FileUploadRequestDto;
import sih.media_service.dtos.UploadDto;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaForwardingService {

    private final SqlServiceClient sqlServiceClient;
    private final SseManagerService sseManagerService;
    private final RoomServiceClient roomServiceClient;

    @Value("${upload.dir:/app/uploads}")
    private String uploadDir;

    // Memory buffer cache in case disk storage directory is restricted
    private static final Map<String, byte[]> MEMORY_CACHE = new ConcurrentHashMap<>();

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
            // Proceed to save media file even if sql metadata throws connection issue
        }

        try {
            byte[] fileBytes = requestDto.getFile() != null ? requestDto.getFile().getBytes() : new byte[0];

            String sanitizedTime = requestDto.getTime() != null
                    ? requestDto.getTime().toString().replace(":", "-")
                    : "00-00-00";

            String ext = requestDto.getFileType() != null ? requestDto.getFileType().toLowerCase() : "bin";
            String generatedFileName = String.format("%s_%s_%s_%s_%s.%s",
                    requestDto.getDate() != null ? requestDto.getDate().toString() : "date",
                    sanitizedTime,
                    requestDto.getLat(),
                    requestDto.getLon(),
                    requestDto.getNumber(),
                    ext
            );

            // 1. Cache in memory for quick retrieval
            MEMORY_CACHE.put(generatedFileName, fileBytes);
            if (requestDto.getFile() != null && requestDto.getFile().getOriginalFilename() != null) {
                MEMORY_CACHE.put(requestDto.getFile().getOriginalFilename(), fileBytes);
            }

            // 2. Persist to disk storage directory
            try {
                Path dirPath = Paths.get(uploadDir);
                if (!Files.exists(dirPath)) {
                    Files.createDirectories(dirPath);
                }
                Path filePath = dirPath.resolve(generatedFileName);
                Files.write(filePath, fileBytes);
                log.info("Persisted media file to disk: {}", filePath.toAbsolutePath());
            } catch (Exception diskEx) {
                log.warn("Could not save to primary disk path {}: {}", uploadDir, diskEx.getMessage());
                // Fallback to local ./uploads directory
                try {
                    Path localPath = Paths.get("./uploads");
                    if (!Files.exists(localPath)) Files.createDirectories(localPath);
                    Files.write(localPath.resolve(generatedFileName), fileBytes);
                    log.info("Persisted media to fallback local path: ./uploads/{}", generatedFileName);
                } catch (Exception e) {
                    log.error("Local disk fallback write failed: {}", e.getMessage());
                }
            }

            // 3. Broadcast to SSE streaming subscribers
            String typeIndicator = "";
            if (requestDto.getFileType() != null) {
                typeIndicator += requestDto.getFileType().toLowerCase();
            }
            if (requestDto.getFile() != null && requestDto.getFile().getOriginalFilename() != null) {
                typeIndicator += " " + requestDto.getFile().getOriginalFilename().toLowerCase();
            }

            if (typeIndicator.contains("m4a") || typeIndicator.contains("audio") || typeIndicator.contains("aac")) {
                sseManagerService.broadcastAudio(fileBytes, requestDto.getLat(), requestDto.getLon());
                log.info("Broadcasted audio (.m4a) to SSE clients.");
            } else {
                sseManagerService.broadcastImage(fileBytes, requestDto.getLat(), requestDto.getLon());
                log.info("Broadcasted image (.jpeg) to SSE clients.");
            }

            // 4. Notify room-service to push live UPLOAD_EVENT to WebSocket clients
            try {
                Map<String, Object> uploadMetadata = Map.of(
                        "fileName", generatedFileName,
                        "number", requestDto.getNumber() != null ? requestDto.getNumber() : 0L,
                        "fileType", ext,
                        "lat", requestDto.getLat() != null ? requestDto.getLat() : 0.0,
                        "lon", requestDto.getLon() != null ? requestDto.getLon() : 0.0
                );
                roomServiceClient.notifyUploadEvent(uploadMetadata);
                log.info("Dispatched live UPLOAD_EVENT notification to room-service.");
            } catch (Exception wsEx) {
                log.debug("Room-service notify upload-event unavailable: {}", wsEx.getMessage());
            }

            return ResponseEntity.ok("File uploaded, persisted, and forwarded via SSE successfully.");
        } catch (Exception ex) {
            log.error("Failed to read file bytes or send via SSE: {}", ex.getMessage());
            throw new RuntimeException("File processing failed", ex);
        }
    }

    public Resource getFileResource(String filename) {
        // First check primary disk directory
        File file = new File(uploadDir, filename);
        if (file.exists() && file.isFile()) {
            return new FileSystemResource(file);
        }

        // Check fallback local ./uploads
        File localFile = new File("./uploads", filename);
        if (localFile.exists() && localFile.isFile()) {
            return new FileSystemResource(localFile);
        }

        return null;
    }

    public byte[] getFileBytesFromCache(String filename) {
        return MEMORY_CACHE.get(filename);
    }
}