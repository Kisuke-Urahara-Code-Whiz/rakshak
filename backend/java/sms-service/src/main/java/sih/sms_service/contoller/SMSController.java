package sih.sms_service.contoller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sih.sms_service.dtos.CitizenContactDto;
import sih.sms_service.dtos.DeviceConfigDto;
import sih.sms_service.dtos.DeviceCredentialsDto;
import sih.sms_service.dtos.DeviceIpDto;
import sih.sms_service.service.SMSGatewayService;

import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SMSController {

    private final SMSGatewayService smsGatewayService;
    private static final AtomicLong LAST_SMS_TIMESTAMP = new AtomicLong(0);
    private static final long RATE_LIMIT_COOLDOWN_MS = 60_000L; // 1 minute cooldown

    @PostMapping({"/sms-alert", "/send-alert", "/sms-alert-message", "/sms-alart-message"})
    public ResponseEntity<String> sendAlert() {
        long currentTime = System.currentTimeMillis();
        while (true) {
            long lastTime = LAST_SMS_TIMESTAMP.get();
            long elapsed = currentTime - lastTime;

            if (lastTime > 0 && elapsed < RATE_LIMIT_COOLDOWN_MS) {
                long remainingSec = (RATE_LIMIT_COOLDOWN_MS - elapsed + 999) / 1000;
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("Rate limit exceeded: /sms-alert can only be accessed once per minute. Cooldown active: " + remainingSec + "s remaining.");
            }

            if (LAST_SMS_TIMESTAMP.compareAndSet(lastTime, currentTime)) {
                break;
            }
        }

        return smsGatewayService.sendAlertSms();
    }

    @PostMapping("/send-welcome-sms")
    public ResponseEntity<String> sendWelcomeSms(@RequestBody CitizenContactDto contactDto) {
        return smsGatewayService.sendWelcomeSms(contactDto);
    }

    /**
     * Route 1: Dynamically set the SMS device IP and optional Port
     */
    @PostMapping({"/set-ip", "/config/ip", "/device/ip"})
    public ResponseEntity<Map<String, Object>> setDeviceIp(
            @RequestBody(required = false) DeviceIpDto dto,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false) Integer port) {
        String targetIp = dto != null && dto.ip() != null ? dto.ip() : ip;
        Integer targetPort = dto != null && dto.port() != null ? dto.port() : port;
        log.info("Updating SMS gateway device IP: {}, port: {}", targetIp, targetPort);
        Map<String, Object> updated = smsGatewayService.updateIp(targetIp, targetPort);
        return ResponseEntity.ok(updated);
    }

    /**
     * Route 2: Dynamically set the SMS device Username and Password
     */
    @PostMapping({"/set-credentials", "/config/credentials", "/device/credentials"})
    public ResponseEntity<Map<String, Object>> setDeviceCredentials(
            @RequestBody(required = false) DeviceCredentialsDto dto,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password) {
        String targetUsername = dto != null && dto.username() != null ? dto.username() : username;
        String targetPassword = dto != null && dto.password() != null ? dto.password() : password;
        log.info("Updating SMS gateway device credentials for user: {}", targetUsername);
        Map<String, Object> updated = smsGatewayService.updateCredentials(targetUsername, targetPassword);
        return ResponseEntity.ok(updated);
    }

    /**
     * Unified Route: Dynamically set IP, Port, Username, and Password in a single request
     */
    @PostMapping({"/config", "/device-config", "/set-device-config"})
    public ResponseEntity<Map<String, Object>> setDeviceConfig(
            @RequestBody(required = false) DeviceConfigDto dto,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false) Integer port,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password) {
        String targetIp = dto != null && dto.ip() != null ? dto.ip() : ip;
        Integer targetPort = dto != null && dto.port() != null ? dto.port() : port;
        String targetUsername = dto != null && dto.username() != null ? dto.username() : username;
        String targetPassword = dto != null && dto.password() != null ? dto.password() : password;
        log.info("Updating full SMS gateway device config: IP={}, port={}, user={}", targetIp, targetPort, targetUsername);
        Map<String, Object> updated = smsGatewayService.updateConfig(targetIp, targetPort, targetUsername, targetPassword);
        return ResponseEntity.ok(updated);
    }

    /**
     * Inspect current dynamic SMS device configuration
     */
    @GetMapping({"/config", "/device-config", "/device/status"})
    public ResponseEntity<Map<String, Object>> getDeviceConfig() {
        return ResponseEntity.ok(smsGatewayService.getConfig());
    }
}