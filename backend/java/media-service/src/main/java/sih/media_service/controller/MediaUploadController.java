package sih.media_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sih.media_service.dtos.FileUploadRequestDto;
import sih.media_service.services.MediaForwardingService;
import sih.media_service.services.SseManagerService;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class MediaUploadController {

    private final MediaForwardingService forwardingService;
    private final SseManagerService sseManagerService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadMedia(@ModelAttribute FileUploadRequestDto requestDto) throws IOException {
        return forwardingService.processAndForward(requestDto);
    }

    @GetMapping(value = "/files/{filename:.+}")
    public ResponseEntity<Resource> getMediaFile(@PathVariable String filename) {
        Resource fileResource = forwardingService.getFileResource(filename);
        MediaType mediaType = resolveMediaType(filename);

        if (fileResource != null && fileResource.exists()) {
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(fileResource);
        }

        byte[] cachedBytes = forwardingService.getFileBytesFromCache(filename);
        if (cachedBytes != null && cachedBytes.length > 0) {
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(cachedBytes));
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping(value = "/sse/audio", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeAudio() {
        return sseManagerService.registerAudioClient();
    }

    @GetMapping(value = "/sse/image", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeImage() {
        return sseManagerService.registerImageClient();
    }

    private MediaType resolveMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".m4a")) return MediaType.valueOf("audio/m4a");
        if (lower.endsWith(".mp3")) return MediaType.valueOf("audio/mpeg");
        if (lower.endsWith(".wav")) return MediaType.valueOf("audio/wav");
        if (lower.endsWith(".mp4")) return MediaType.valueOf("video/mp4");
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}