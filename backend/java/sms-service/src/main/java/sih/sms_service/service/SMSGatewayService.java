package sih.sms_service.service;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import sih.sms_service.config.SMSDeviceConfig;
import sih.sms_service.entities.SMSPayload;
import sih.sms_service.entities.TextMessage;

@Service
public class SMSGatewayService {

    private final RestClient restClient;
    private final SMSClientService smsClientService;


    public SMSGatewayService(SMSDeviceConfig properties, SMSClientService smsClientService) {
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeaders(headers -> headers.setBasicAuth(properties.username(), properties.password()))
                .build();
        this.smsClientService = smsClientService;
    }

    public ResponseEntity<String> sendSms() {

        List<String> numbers = smsClientService.getNumbers();
        String message = "HEAVY ENVIRONMENTAL RISK IN YOUR ZONE. PLEASE MOVE TOWARDS HIGHER GROUND ADN PREVENT FROM STAYING ON LOW LEVEL GROUNDS";
        SMSPayload payload = new SMSPayload(new TextMessage(message), numbers);

        return restClient.post()
                .uri("/message")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(String.class);
    }

    public ResponseEntity<String> sendWelcomeSms(String number) {

        String message = "WELCOME TO RAKSHAK APP";
        SMSPayload payload = new SMSPayload(new TextMessage(message), List.of(number));

        return restClient.post()
                .uri("/message")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(String.class);
    }

}