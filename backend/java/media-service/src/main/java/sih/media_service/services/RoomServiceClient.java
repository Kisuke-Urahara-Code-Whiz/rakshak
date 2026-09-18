package sih.media_service.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "room-service")
@Service
public interface RoomServiceClient {

    @PostMapping("/upload-event")
    Map<String, String> notifyUploadEvent(@RequestBody Map<String, Object> uploadData);
}
