package sih.sms_service.dtos;

public record DeviceConfigDto(
        String ip,
        Integer port,
        String username,
        String password
) {}
