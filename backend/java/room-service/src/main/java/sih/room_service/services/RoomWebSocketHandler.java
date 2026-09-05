package sih.room_service.services;

import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class RoomWebSocketHandler extends TextWebSocketHandler {
    private final RoomManager roomManager;

    public RoomWebSocketHandler(RoomManager roomManager) {
        this.roomManager = roomManager;
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        String number = getNumberFromSession(session);
        if (number != null) {
            roomManager.addUser(number, session);
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        String number = getNumberFromSession(session);
        if (number != null) {
            roomManager.removeUser(number);
        }
    }

    private String getNumberFromSession(WebSocketSession session) {
        if (session.getUri() != null && session.getUri().getQuery() != null) {
            String query = session.getUri().getQuery();
            if (query.contains("number=")) {
                return "+91"+query.split("number=")[1].split("&")[0];
            }
        }
        return null;
    }
}