package sih.sql_service.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Setter
@Getter
@Entity
@Table(name = "uploads")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Upload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "number", nullable = false)
    private Long number;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "upload_date", nullable = false)
    private LocalDate date;

    @Column(name = "lat", nullable = false)
    private Double latitude;

    @Column(name = "long", nullable = false)
    private Double longitude;

    @Column(name = "upload_time", nullable = false)
    private LocalTime time;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "questionnaire", columnDefinition = "TEXT")
    private String questionnaire;

}