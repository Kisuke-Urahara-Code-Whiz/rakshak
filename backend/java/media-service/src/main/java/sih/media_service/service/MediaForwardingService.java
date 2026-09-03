package sih.media_service.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class MediaForwardingService {

    private final RestClient externalServiceClient;

    public MediaForwardingService(RestClient externalServiceClient) {
        this.externalServiceClient = externalServiceClient;
    }

    public ResponseEntity<String> forwardMedia(String endpointPath, MultipartFile file, Double lat, Double lon) throws IOException {

        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("latitude", lat);
        body.add("longitude", lon);

        return externalServiceClient.post()
                .uri(endpointPath)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .toEntity(String.class);

    }
}