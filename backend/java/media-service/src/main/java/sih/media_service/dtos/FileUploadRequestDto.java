package sih.media_service.dtos;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadRequestDto {
    private Long number;
    private String fileType;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    private Double lat;
    private Double lon;

    @DateTimeFormat(pattern = "HH:mm:ss")
    private LocalTime time;

    private MultipartFile file;
    private String questionnaire;
}