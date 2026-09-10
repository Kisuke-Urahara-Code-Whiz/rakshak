package sih.sql_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sih.sql_service.dtos.CitizenContactDto;
import sih.sql_service.entities.Citizen;

import java.util.List;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {

    @Query("SELECT new sih.sql_service.dtos.CitizenContactDto(CAST(c.number AS string), c.lang) FROM Citizen c")
    List<CitizenContactDto> findAllNumbersWithLang();
}