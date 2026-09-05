package sih.room_service.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import sih.room_service.services.RoomManager;

@RestController
public class RoomController {
    private final RoomManager roomManager;

    public RoomController(RoomManager roomManager) {
        this.roomManager = roomManager;
    }

    @GetMapping("/getUsers")
    public ResponseEntity<List<String>> getConnectedUsers() {
        return ResponseEntity.ok(roomManager.getConnectedUserNumbers());
    }
}