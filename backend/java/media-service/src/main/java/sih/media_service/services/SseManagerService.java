package sih.media_service.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sih.media_service.dtos.MediaSsePayload;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseManagerService {

    private final List<SseEmitter> audioEmitters = new CopyOnWriteArrayList<>();
    private final List<SseEmitter> imageEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter registerAudioClient() {
        SseEmitter emitter = new SseEmitter(0L);
        audioEmitters.add(emitter);

        emitter.onCompletion(() -> audioEmitters.remove(emitter));
        emitter.onTimeout(() -> audioEmitters.remove(emitter));
        emitter.onError(e -> audioEmitters.remove(emitter));

        return emitter;
    }

    public SseEmitter registerImageClient() {
        SseEmitter emitter = new SseEmitter(0L);
        imageEmitters.add(emitter);

        emitter.onCompletion(() -> imageEmitters.remove(emitter));
        emitter.onTimeout(() -> imageEmitters.remove(emitter));
        emitter.onError(e -> imageEmitters.remove(emitter));

        return emitter;
    }

    public void broadcastAudio(byte[] fileBytes, Double lat, Double lon) {
        String base64 = Base64.getEncoder().encodeToString(fileBytes);
        MediaSsePayload payload = MediaSsePayload.builder()
                .fileData(base64)
                .fileType("audio/m4a")
                .lat(lat)
                .lon(lon)
                .build();

        sendToEmitters(audioEmitters, "audio-event", payload);
    }

    public void broadcastImage(byte[] fileBytes, Double lat, Double lon) {
        String base64 = Base64.getEncoder().encodeToString(fileBytes);
        MediaSsePayload payload = MediaSsePayload.builder()
                .fileData(base64)
                .fileType("image/jpeg")
                .lat(lat)
                .lon(lon)
                .build();

        sendToEmitters(imageEmitters, "image-event", payload);
    }

    private void sendToEmitters(List<SseEmitter> emitters, String eventName, MediaSsePayload payload) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(payload));
            } catch (IOException ex) {
                emitters.remove(emitter);
            }
        }
    }
}