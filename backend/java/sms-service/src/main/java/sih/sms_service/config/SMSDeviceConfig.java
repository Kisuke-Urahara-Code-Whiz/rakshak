package sih.sms_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sms.device")
public record SMSDeviceConfig(
        String ip,
        Integer port,
        String username,
        String password
) {
    public String getBaseUrl() {
        return "http://" + ip + ":" + port;
    }
}