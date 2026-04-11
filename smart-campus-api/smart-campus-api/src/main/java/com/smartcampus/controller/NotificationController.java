package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.NotificationRepository; // FIX: Added this import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/notifications — get current user's notifications
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyNotifications(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved", notifications));
    }

    // PUT /api/notifications/{id}/read — mark a single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    // PUT /api/notifications/read-all — mark all for current user as read
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<?>> markAllAsRead(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Notification> unread = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
    }

    // DELETE /api/notifications/{id} — delete a specific notification
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification deleted", null));
    }
}