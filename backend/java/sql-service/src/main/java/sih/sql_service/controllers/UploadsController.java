package sih.sql_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sih.sql_service.dtos.UploadResponseDto;
import sih.sql_service.services.UploadService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UploadsController {

    private final UploadService uploadService;

    @GetMapping("/uploads")
    public ResponseEntity<List<UploadResponseDto>> getUploads(@RequestParam(required = false) Long number) {
        if (number != null && number > 0) {
            return ResponseEntity.ok(uploadService.getUploadsByNumber(number));
        }
        return ResponseEntity.ok(uploadService.getAllUploads());
    }
}
