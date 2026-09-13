package sih.sql_service.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import sih.sql_service.dtos.CitizenContactDto;

@FeignClient(name = "sms-service")
public interface SmsFeignClient {

    @PostMapping("/send-welcome-sms")
    String sendSms(@RequestBody CitizenContactDto contactDto);
}