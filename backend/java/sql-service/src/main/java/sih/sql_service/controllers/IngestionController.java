package sih.sql_service.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import lombok.RequiredArgsConstructor;
import sih.sql_service.dtos.CitizenLocationDto;
import sih.sql_service.dtos.UploadDto;
import sih.sql_service.services.CitizenService;
import sih.sql_service.services.UploadService;


@RestController
@RequiredArgsConstructor
public class IngestionController {

    private final CitizenService citizenService;
    private final UploadService uploadService;

    @PostMapping("/enter")
    public ResponseEntity<String> enter(@RequestBody CitizenLocationDto dto) {
        String result = citizenService.processLocation(dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> createUpload(@RequestBody UploadDto dto) {
        String response = uploadService.saveUpload(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/numbers")
    public ResponseEntity<List<String>> getAllCitizenNumbers() {
        List<String> numbers = citizenService.getAllNumbers();
        return ResponseEntity.ok(numbers);
    }

}