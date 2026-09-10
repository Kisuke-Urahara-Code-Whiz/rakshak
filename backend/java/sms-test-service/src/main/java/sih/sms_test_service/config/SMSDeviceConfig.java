package sih.sms_test_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "sms.device")
public record SMSDeviceConfig(
        String ip,
        Integer port,
        String username,
        String password,
        String defaultMessage,
        List<String> defaultPhoneNumbers
) {
    public String getBaseUrl() {
        return "http://" + ip + ":" + port;
    }
}