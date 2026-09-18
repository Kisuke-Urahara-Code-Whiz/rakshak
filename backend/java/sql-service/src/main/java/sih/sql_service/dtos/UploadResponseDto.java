package sih.sql_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponseDto {
    private String id;
    private String phoneNumber;
    private String uploadType; // "photo" or "audio"
    private String mediaFormat;
    private String fileName;
    private String fileSize;
    private String fileUrl;
    private String timestamp;
    private String relativeTime;
    private LocationInfo location;
    private String verificationStatus;
    private String severity;
    private GroundQuestionnaire groundQuestionnaire;
    private Map<String, Object> payload;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationInfo {
        private String state;
        private String district;
        private String locality;
        private Coordinates coordinates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroundQuestionnaire {
        private String activityStatus;
        private String weatherCondition;
        private List<String> warningIndicators;
        private List<String> infrastructureThreatened;
        private String urgencyLevel;
        private Boolean immediateEvacuationNeeded;
        private String additionalNotes;
    }
}
