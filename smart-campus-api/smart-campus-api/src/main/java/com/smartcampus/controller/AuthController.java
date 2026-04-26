package com.smartcampus.controller;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class AuthController {

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @GetMapping("/")
    public RedirectView redirectRoot() {
        return new RedirectView(frontendBaseUrl + "/", true);
    }

    @GetMapping("/api/auth/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser(
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(
                ApiResponse.success(user, "Current user"));
    }
}