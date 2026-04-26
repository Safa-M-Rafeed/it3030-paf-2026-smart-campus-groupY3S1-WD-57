package com.smartcampus.controller;
import com.smartcampus.dto.request.NotificationEventRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
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
@PathVariable String id,
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
@PathVariable String id,
Authentication auth) {
User user = (User) auth.getPrincipal();
svc.delete(id, user.getId());
return ResponseEntity.ok(ApiResponse.success(
null, "Notification deleted"));
}

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
}