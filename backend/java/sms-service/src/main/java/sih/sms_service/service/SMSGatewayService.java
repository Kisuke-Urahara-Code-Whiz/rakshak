package sih.sms_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import sih.sms_service.config.SMSDeviceConfig;
import sih.sms_service.constant.LandslideAlertMessages;
import sih.sms_service.constant.WelcomeAlertMessages;
import sih.sms_service.dtos.CitizenContactDto;
import sih.sms_service.entities.SMSPayload;
import sih.sms_service.entities.TextMessage;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SMSGatewayService {

    private final SMSClientService smsClientService;

    private volatile String currentIp;
    private volatile Integer currentPort;
    private volatile String currentUsername;
    private volatile String currentPassword;
    private volatile RestClient restClient;

    public SMSGatewayService(SMSDeviceConfig properties, SMSClientService smsClientService) {
        this.smsClientService = smsClientService;
        this.currentIp = properties.ip();
        this.currentPort = properties.port() != null ? properties.port() : 8080;
        this.currentUsername = properties.username();
        this.currentPassword = properties.password();
        rebuildRestClient();
    }

    private synchronized void rebuildRestClient() {
        String cleanIp = currentIp != null ? currentIp.trim() : "localhost";
        int port = (currentPort != null && currentPort > 0) ? currentPort : 8080;

        String baseUrl;
        if (cleanIp.startsWith("http://") || cleanIp.startsWith("https://")) {
            baseUrl = cleanIp;
        } else {
            baseUrl = "http://" + cleanIp + ":" + port;
        }

        RestClient.Builder builder = RestClient.builder().baseUrl(baseUrl);
        if (currentUsername != null && currentPassword != null && !currentUsername.isBlank()) {
            builder.defaultHeaders(headers -> headers.setBasicAuth(currentUsername, currentPassword));
        }
        this.restClient = builder.build();
        log.info("SMSGatewayService RestClient rebuilt with baseUrl: {}, username: {}", baseUrl, currentUsername);
    }

    public synchronized Map<String, Object> updateIp(String ip, Integer port) {
        if (ip != null && !ip.isBlank()) {
            this.currentIp = ip.trim();
        }
        if (port != null && port > 0) {
            this.currentPort = port;
        }
        rebuildRestClient();
        return getConfig();
    }

    public synchronized Map<String, Object> updateCredentials(String username, String password) {
        if (username != null) {
            this.currentUsername = username.trim();
        }
        if (password != null) {
            this.currentPassword = password.trim();
        }
        rebuildRestClient();
        return getConfig();
    }

    public synchronized Map<String, Object> updateConfig(String ip, Integer port, String username, String password) {
        if (ip != null && !ip.isBlank()) {
            this.currentIp = ip.trim();
        }
        if (port != null && port > 0) {
            this.currentPort = port;
        }
        if (username != null) {
            this.currentUsername = username.trim();
        }
        if (password != null) {
            this.currentPassword = password.trim();
        }
        rebuildRestClient();
        return getConfig();
    }

    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        String cleanIp = currentIp != null ? currentIp.trim() : "localhost";
        int port = (currentPort != null && currentPort > 0) ? currentPort : 8080;
        String baseUrl = (cleanIp.startsWith("http://") || cleanIp.startsWith("https://"))
                ? cleanIp
                : "http://" + cleanIp + ":" + port;

        config.put("ip", cleanIp);
        config.put("port", port);
        config.put("username", currentUsername != null ? currentUsername : "");
        config.put("baseUrl", baseUrl);
        config.put("configured", currentIp != null && !currentIp.contains("<device_local_ip>"));
        config.put("hasPassword", currentPassword != null && !currentPassword.isBlank() && !currentPassword.contains("<password>"));
        return config;
    }

    public ResponseEntity<String> sendWelcomeSms(CitizenContactDto contact) {
        String formattedNumber = contact.number().startsWith("+91")
                ? contact.number()
                : "+91" + contact.number();

        String message = WelcomeAlertMessages.getMessage(contact.lang());
        SMSPayload payload = new SMSPayload(new TextMessage(message), List.of(formattedNumber));

        return restClient.post()
                .uri("/message")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(String.class);
    }

    public ResponseEntity<String> sendAlertSms() {
        List<CitizenContactDto> contacts = smsClientService.getNumbers();

        Map<String, List<String>> languageGroups = contacts.stream()
                .collect(Collectors.groupingBy(
                        c -> c.lang() != null ? c.lang().trim().toLowerCase() : "en",
                        Collectors.mapping(
                                c -> c.number().startsWith("+91") ? c.number() : "+91" + c.number(),
                                Collectors.toList()
                        )
                ));

        for (Map.Entry<String, List<String>> entry : languageGroups.entrySet()) {
            String lang = entry.getKey();
            List<String> phoneNumbers = entry.getValue();

            String alertMessage = LandslideAlertMessages.getMessage(lang);
            SMSPayload payload = new SMSPayload(new TextMessage(alertMessage), phoneNumbers);

            restClient.post()
                    .uri("/message")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);
        }

        return ResponseEntity.ok("Alert SMS dispatched to all citizens");
    }
}