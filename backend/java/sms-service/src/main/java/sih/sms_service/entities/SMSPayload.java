package sih.sms_service.entities;

import java.util.*;

public record SMSPayload(TextMessage textMessage, List<String> phoneNumbers) {}