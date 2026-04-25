package com.smartcampus.controller;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class AuthController {

    @GetMapping("/")
    public RedirectView redirectRoot() {
        return new RedirectView("http://localhost:5173/", true);
    }

    @GetMapping("/api/auth/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser(
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(
                ApiResponse.success(user, "Current user"));
    }
}