package sih.sql_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String status; // "SUCCESS" or "FAILED"
    private String message;
    private String token;
    private String role;
    private String identifier;
    private String name;
    private String department;
    private String district;
    private String state;
    private String lang;
}
