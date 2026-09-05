package sih.sms_service.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "room-service")
public interface SMSClientService {

    @GetMapping("/getUsers")
    List<String> getNumbers();

}