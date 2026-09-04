package sih.sms_test_service.contoller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sih.sms_test_service.service.SMSGatewayService;

@RestController
@RequestMapping("/")
public class SMSController {

    private final SMSGatewayService smsGatewayService;

    public SMSController(SMSGatewayService smsGatewayService) {
        this.smsGatewayService = smsGatewayService;
    }

    @PostMapping("/broadcast-default")
    public ResponseEntity<String> broadcastDefault() {
        return smsGatewayService.sendDefaultBroadcast();
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendCustomSms(@RequestBody String message) {
        return smsGatewayService.sendSms(message);
    }
}