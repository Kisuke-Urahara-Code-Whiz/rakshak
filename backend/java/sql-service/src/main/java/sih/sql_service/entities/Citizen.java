package sih.sql_service.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "citizens")
public class Citizen {

    @Id
    @Column(name = "number", nullable = false, unique = true)
    private Long number;

    @Column(name = "lat", nullable = false)
    private Double latitude;

    @Column(name = "long", nullable = false)
    private Double longitude;


}