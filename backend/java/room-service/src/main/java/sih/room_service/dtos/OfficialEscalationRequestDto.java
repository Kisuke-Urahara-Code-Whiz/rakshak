package sih.room_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficialEscalationRequestDto {
    private String employeeId;
    private String role;
    private String userName;
    private String department;
    private String district;
    private String state;
    private Double latitude;
    private Double longitude;
    private String message;
    private Integer riskScore;
}
