package sih.sms_test_service.service;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import sih.sms_test_service.config.SMSDeviceConfig;
import sih.sms_test_service.entities.SMSPayload;
import sih.sms_test_service.entities.TextMessage;

@Service
public class SMSGatewayService {

    private final RestClient restClient;
    private final SMSDeviceConfig properties;

    public SMSGatewayService(SMSDeviceConfig properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeaders(headers -> headers.setBasicAuth(properties.username(), properties.password()))
                .build();
    }

    public ResponseEntity<String> sendDefaultBroadcast() {
        return sendSms(properties.defaultMessage());
    }

    public ResponseEntity<String> sendSms(String messageText) {
        SMSPayload payload = new SMSPayload(new TextMessage(messageText), properties.defaultPhoneNumbers());

        return restClient.post()
                .uri("/message")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(String.class);
    }
}