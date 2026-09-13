package sih.media_service.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import sih.media_service.dtos.UploadDto;

@FeignClient(name = "sql-service")
@Service
public interface SqlServiceClient {

    @PostMapping("/upload")
    String saveUploadRecord(@RequestBody UploadDto dto);
}