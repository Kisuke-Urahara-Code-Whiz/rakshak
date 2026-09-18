package sih.sql_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sih.sql_service.entities.Upload;

import java.util.List;

@Repository
public interface UploadRepository extends JpaRepository<Upload, Long> {
    List<Upload> findAllByOrderByIdDesc();
    List<Upload> findByNumberOrderByIdDesc(Long number);
}