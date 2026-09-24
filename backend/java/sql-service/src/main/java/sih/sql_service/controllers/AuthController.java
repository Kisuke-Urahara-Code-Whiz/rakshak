package sih.sql_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sih.sql_service.dtos.LoginRequestDto;
import sih.sql_service.dtos.LoginResponseDto;
import sih.sql_service.services.AuthService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginDto) {
        LoginResponseDto response = authService.authenticate(loginDto);
        if ("FAILED".equals(response.getStatus())) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(List.of(
                "Citizen",
                "MDoNER Employee",
                "Zonal Admin",
                "District Admin"
        ));
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifySession(@RequestParam(required = false) String token) {
        return ResponseEntity.ok(Map.of(
                "valid", token != null && !token.isBlank(),
                "timestamp", System.currentTimeMillis()
        ));
    }
}
