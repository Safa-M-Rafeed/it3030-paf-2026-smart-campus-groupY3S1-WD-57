package com.smartcampus.controller;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
public class AuthController {

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/")
    public RedirectView redirectRoot() {
        return new RedirectView(frontendBaseUrl + "/", true);
    }

    @GetMapping("/api/auth/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser(
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }

        return ResponseEntity.ok(
                ApiResponse.success(user, "Current user"));
    }

    @PostMapping("/api/auth/dev-token")
    public ResponseEntity<ApiResponse<?>> issueDevToken(
            @RequestParam String email,
            @RequestParam(defaultValue = "USER") String role,
            @RequestParam(required = false) String name
    ) {
        Role parsedRole;
        try {
            parsedRole = Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid role. Allowed: USER, ADMIN, TECHNICIAN, MANAGER"));
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name == null || name.isBlank() ? email : name);
            newUser.setRole(parsedRole);
            return newUser;
        });

        user.setRole(parsedRole);
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        userRepository.save(user);

        String token = jwtUtil.generateToken(email, parsedRole.name());
        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of(
                                "token", token,
                                "email", email,
                                "role", parsedRole.name()
                        ),
                        "Dev token issued"));
    }
}