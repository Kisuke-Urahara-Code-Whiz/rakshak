package sih.media_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaSsePayload {
    private String fileData;
    private String fileType;
    private Double lat;
    private Double lon;
}