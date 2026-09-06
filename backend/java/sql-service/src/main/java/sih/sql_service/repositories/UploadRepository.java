package sih.sql_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sih.sql_service.entities.Upload;

@Repository
public interface UploadRepository extends JpaRepository<Upload, Long> {
}