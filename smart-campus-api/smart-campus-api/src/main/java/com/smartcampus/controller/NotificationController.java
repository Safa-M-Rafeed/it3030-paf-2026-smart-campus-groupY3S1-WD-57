package com.smartcampus.controller;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
@PathVariable Long id) {
return ResponseEntity.ok(ApiResponse.success(
svc.markRead(id), "Marked as read"));
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
@PathVariable Long id) {
svc.delete(id);
return ResponseEntity.ok(ApiResponse.success(
null, "Notification deleted"));
}
}