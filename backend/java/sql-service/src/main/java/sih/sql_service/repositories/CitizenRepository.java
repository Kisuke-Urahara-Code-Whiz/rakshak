package sih.sql_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

import sih.sql_service.entities.Citizen;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {

    @Query("SELECT CAST(c.number AS string) FROM Citizen c")
    List<String> findAllNumbersAsString();

}
