package sih.room_service.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RawAlertWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> activeSessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        activeSessions.add(session);
        log.info("Raw WebSocket connected: session={}, total active={}", session.getId(), activeSessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        activeSessions.remove(session);
        log.info("Raw WebSocket disconnected: session={}, status={}, remaining={}", session.getId(), status, activeSessions.size());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("Raw WebSocket transport error on session {}: {}", session.getId(), exception.getMessage());
        activeSessions.remove(session);
    }

    public void broadcast(String messagePayload) {
        log.info("Broadcasting raw message to {} WebSocket sessions", activeSessions.size());
        for (WebSocketSession session : activeSessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(messagePayload));
                } catch (IOException e) {
                    log.error("Failed to send message to session {}: {}", session.getId(), e.getMessage());
                    activeSessions.remove(session);
                }
            }
        }
    }

    public int getActiveSessionCount() {
        return activeSessions.size();
    }
}
