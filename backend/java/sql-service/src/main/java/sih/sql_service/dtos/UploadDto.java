package sih.sql_service.dtos;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadDto {
    private Long number;
    private String fileType;
    private LocalDate date;
    private Double lat;
    private Double lon;
    private LocalTime time;
}