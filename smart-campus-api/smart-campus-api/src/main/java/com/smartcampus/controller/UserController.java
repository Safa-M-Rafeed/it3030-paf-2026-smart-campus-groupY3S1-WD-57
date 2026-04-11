package com.smartcampus.controller;

import com.smartcampus.dto.request.RoleUpdateDto;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET /api/users — List all users (ADMIN only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All users retrieved successfully", users));
    }

    // PUT /api/users/{id}/role — Change user role (ADMIN only)
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> changeRole(
            @PathVariable Long id, 
            @RequestBody RoleUpdateDto dto) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        try {
            // Convert String from DTO to your Role Enum
            Role newRole = Role.valueOf(dto.getRole().toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "User role updated to " + newRole, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid role provided", null));
        }
    }
}