package sih.sql_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sih.sql_service.dtos.CitizenContactDto;
import sih.sql_service.dtos.CitizenLanguageUpdateDto;
import sih.sql_service.dtos.CitizenLocationDto;
import sih.sql_service.dtos.UploadDto;
import sih.sql_service.services.CitizenService;
import sih.sql_service.services.UploadService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class IngestionController {

    private final CitizenService citizenService;
    private final UploadService uploadService;

    @PostMapping("/enter")
    public ResponseEntity<String> enter(@RequestBody CitizenLocationDto dto) {
        String lang = citizenService.processLocation(dto);
        return ResponseEntity.ok(lang);
    }

    @PutMapping("/citizen/language")
    public ResponseEntity<String> updateLanguage(@RequestBody CitizenLanguageUpdateDto dto) {
        String updatedLang = citizenService.updateLanguage(dto);
        return ResponseEntity.ok(updatedLang);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> createUpload(@RequestBody UploadDto dto) {
        String response = uploadService.saveUpload(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/numbers")
    public ResponseEntity<List<CitizenContactDto>> getAllCitizenNumbers() {
        List<CitizenContactDto> contacts = citizenService.getAllNumbersWithLang();
        return ResponseEntity.ok(contacts);
    }
}