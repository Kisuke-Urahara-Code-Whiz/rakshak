package sih.sms_service.service;

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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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