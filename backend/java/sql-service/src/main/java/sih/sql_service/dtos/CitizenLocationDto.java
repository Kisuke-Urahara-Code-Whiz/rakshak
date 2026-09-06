package sih.sql_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CitizenLocationDto {

    private Long number;
    private Double lat;
    private Double lon;

}