package sih.room_service.services;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomManager {
    private final Map<String, WebSocketSession> activeUsers = new ConcurrentHashMap<>();

    public void addUser(String number, WebSocketSession session) {
        activeUsers.put(number, session);
    }

    public void removeUser(String number) {
        activeUsers.remove(number);
    }

    public List<String> getConnectedUserNumbers() {
        return new ArrayList<>(activeUsers.keySet());
    }
}