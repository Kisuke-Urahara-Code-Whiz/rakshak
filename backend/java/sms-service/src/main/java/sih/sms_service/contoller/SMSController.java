package sih.sms_service.contoller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sih.sms_service.dtos.CitizenContactDto;
import sih.sms_service.service.SMSGatewayService;

import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequiredArgsConstructor
public class SMSController {

    private final SMSGatewayService smsGatewayService;
    private static final AtomicLong LAST_SMS_TIMESTAMP = new AtomicLong(0);
    private static final long RATE_LIMIT_COOLDOWN_MS = 60_000L; // 1 minute cooldown

    @PostMapping({"/send-alert", "/sms-alert-message", "/sms-alart-message"})
    public ResponseEntity<String> sendAlert() {
        long currentTime = System.currentTimeMillis();
        long lastTime = LAST_SMS_TIMESTAMP.get();
        long elapsed = currentTime - lastTime;

        if (lastTime > 0 && elapsed < RATE_LIMIT_COOLDOWN_MS) {
            long remainingSec = (RATE_LIMIT_COOLDOWN_MS - elapsed + 999) / 1000;
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded: /sms-alart-message can only be accessed once per minute. Cooldown active: " + remainingSec + "s remaining.");
        }

        LAST_SMS_TIMESTAMP.set(currentTime);
        return smsGatewayService.sendAlertSms();
    }

    @PostMapping("/send-welcome-sms")
    public ResponseEntity<String> sendWelcomeSms(@RequestBody CitizenContactDto contactDto) {
        return smsGatewayService.sendWelcomeSms(contactDto);
    }
}