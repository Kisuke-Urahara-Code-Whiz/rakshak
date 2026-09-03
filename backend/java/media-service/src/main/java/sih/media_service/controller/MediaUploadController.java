package sih.media_service.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import sih.media_service.service.MediaForwardingService;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

    private final MediaForwardingService forwardingService;

    public MediaUploadController(MediaForwardingService forwardingService) {
        this.forwardingService = forwardingService;
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadAndForwardPhoto(
            @RequestPart("file") MultipartFile file,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude
    ) throws IOException {
        return forwardingService.forwardMedia("/receive/photo", file, latitude, longitude);
    }

    @PostMapping(value = "/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadAndForwardAudio(
            @RequestPart("file") MultipartFile file,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude
    ) throws IOException {
        return forwardingService.forwardMedia("/receive/audio", file, latitude, longitude);
    }
}