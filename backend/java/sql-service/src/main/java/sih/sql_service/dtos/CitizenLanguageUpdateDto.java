package sih.sql_service.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenLanguageUpdateDto {
    private Long number;
    private String lang;
    private String userType;
}