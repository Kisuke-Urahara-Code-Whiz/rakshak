package sih.media_service.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import lombok.RequiredArgsConstructor;
import sih.media_service.dtos.FileUploadRequestDto;
import sih.media_service.service.MediaForwardingService;

@RestController
@RequiredArgsConstructor
public class MediaUploadController {

    private final MediaForwardingService forwardingService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadMedia(@ModelAttribute FileUploadRequestDto requestDto) throws IOException {
        return forwardingService.processAndForward(requestDto);
    }
}