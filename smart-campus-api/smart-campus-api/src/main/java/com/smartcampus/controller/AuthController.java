package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/auth/me
     * Returns the profile of the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "User is not authenticated", null));
        }

        // Usually, the principal in Spring Security with JWT is the username (email)
        String email = auth.getName(); 
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        // Hide sensitive data if necessary before returning (like password if it exists)
        return ResponseEntity.ok(new ApiResponse<>(true, "Current user profile retrieved", user));
    }
}