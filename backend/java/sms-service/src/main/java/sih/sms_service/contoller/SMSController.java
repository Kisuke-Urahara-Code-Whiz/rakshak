package sih.sms_service.contoller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import sih.sms_service.service.SMSGatewayService;

@RestController
@RequiredArgsConstructor
public class SMSController {

    private final SMSGatewayService smsGatewayService;

    @PostMapping("/send-alert")
    public ResponseEntity<String> sendCustomSms() {
        return smsGatewayService.sendSms();
    }

    @PostMapping("/send-welcome-sms")
    public ResponseEntity<String> sendCustomSms(@RequestBody String number) {
        return smsGatewayService.sendWelcomeSms("+91"+number);
    }
}