package sih.sms_service.contoller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sih.sms_service.dtos.CitizenContactDto;
import sih.sms_service.service.SMSGatewayService;

@RestController
@RequiredArgsConstructor
public class SMSController {

    private final SMSGatewayService smsGatewayService;

    @PostMapping("/send-alert")
    public ResponseEntity<String> sendAlert() {
        return smsGatewayService.sendAlertSms();
    }

    @PostMapping("/send-welcome-sms")
    public ResponseEntity<String> sendWelcomeSms(@RequestBody CitizenContactDto contactDto) {
        return smsGatewayService.sendWelcomeSms(contactDto);
    }
}