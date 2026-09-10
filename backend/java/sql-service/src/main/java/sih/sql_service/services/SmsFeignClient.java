package sih.sql_service.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "sms-service")
@Service
public interface SmsFeignClient {

    @PostMapping("/send-welcome-sms")
    String sendSms(@RequestBody String number);
}