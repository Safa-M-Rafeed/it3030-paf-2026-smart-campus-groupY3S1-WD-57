package com.smartcampus.controller;
import com.smartcampus.dto.request.NotificationEventRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
<<<<<<< HEAD
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.NotificationRepository;
=======
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
>>>>>>> b9829a34ac2c827600733d96cf2675c767dd9906
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
@Autowired private NotificationService svc;
// GET /api/notifications
@GetMapping
public ResponseEntity<ApiResponse<?>> getMyNotifications(
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.ok(ApiResponse.success(
svc.getForUser(user.getId()),
"Notifications fetched"));
}
// PUT /api/notifications/{id}/read
@PutMapping("/{id}/read")
public ResponseEntity<ApiResponse<?>> markAsRead(
@PathVariable Long id,
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.ok(ApiResponse.success(
svc.markRead(id, user.getId()), "Marked as read"));
}
// PUT /api/notifications/read-all
@PutMapping("/read-all")
public ResponseEntity<ApiResponse<?>> markAllAsRead(
Authentication auth) {
User user = (User) auth.getPrincipal();
svc.markAllRead(user.getId());
return ResponseEntity.ok(ApiResponse.success(
null, "All marked as read"));
}
// DELETE /api/notifications/{id}
@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<?>> delete(
@PathVariable Long id,
Authentication auth) {
User user = (User) auth.getPrincipal();
svc.delete(id, user.getId());
return ResponseEntity.ok(ApiResponse.success(
null, "Notification deleted"));
}

<<<<<<< HEAD
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyNotifications(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true); 
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<?>> markAllAsRead(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // FIX: Ensure this line is exactly here to define 'unread'
        List<Notification> unread = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification deleted", null));
    }
=======
// POST /api/notifications/events/test
// Temporary integration endpoint to trigger assignment Module D events
// until Booking/Ticket/Comment modules are fully wired.
@PostMapping("/events/test")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public ResponseEntity<ApiResponse<?>> triggerEvent(
        @Valid @RequestBody NotificationEventRequest req,
        Authentication auth
) {
    User actor = (User) auth.getPrincipal();
    return ResponseEntity.ok(ApiResponse.success(
            svc.triggerEvent(req, actor),
            "Notification event triggered"));
}
>>>>>>> b9829a34ac2c827600733d96cf2675c767dd9906
}