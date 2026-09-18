package sih.sql_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    private String role; // "Citizen", "MDoNER Employee", "Zonal Admin", "District Admin"
    private String identifier; // Mobile number (Citizen) or Employee ID (Officials)
    private String password; // Password for Officials
    private Double latitude; // Optional GPS location
    private Double longitude; // Optional GPS location
}
