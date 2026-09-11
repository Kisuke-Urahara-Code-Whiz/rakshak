package sih.media_service.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

import lombok.RequiredArgsConstructor;
import sih.media_service.dtos.FileUploadRequestDto;
import sih.media_service.services.MediaForwardingService;
import sih.media_service.services.SseManagerService;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MediaUploadController {

    private final MediaForwardingService forwardingService;
    private final SseManagerService sseManagerService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadMedia(@ModelAttribute FileUploadRequestDto requestDto) throws IOException {
        return forwardingService.processAndForward(requestDto);
    }

    @GetMapping(value = "/sse/audio", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeAudio() {
        return sseManagerService.registerAudioClient();
    }

    @GetMapping(value = "/sse/image", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeImage() {
        return sseManagerService.registerImageClient();
    }
}