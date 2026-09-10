package sih.sms_test_service.entities;

import java.util.*;

public record SMSPayload(TextMessage textMessage, List<String> phoneNumbers) {}