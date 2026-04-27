package com.smartcampus.controller;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.CommentService;
import com.smartcampus.service.TicketService;
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
@Autowired private TicketService ticketService;
@Autowired private CommentService commentService;
// POST /api/tickets — create ticket (multipart)
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<?>> createTicket(
@RequestPart("facilityName") String facilityName,
@RequestPart("category") String category,
@RequestPart("description") String description,
@RequestPart("priority") String priority,
@RequestPart(value="contactDetails",required=false)
String contactDetails,
@RequestPart(value="attachments",required=false)
List<MultipartFile> attachments,
Authentication auth) throws IOException {
User user = (User) auth.getPrincipal();
return ResponseEntity.status(HttpStatus.CREATED)
.body(ApiResponse.success(
ticketService.createTicket(
facilityName, category, description,
priority, contactDetails, user, attachments),
"Ticket created"));
}
// GET /api/tickets — list (own / all based on role)
@GetMapping
public ResponseEntity<ApiResponse<?>> getTickets(
@RequestParam(name = "status", required=false) String status,
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.ok(ApiResponse.success(
ticketService.getTickets(user, status),
"Tickets fetched"));
}
// GET /api/tickets/{id} — single ticket with attachments
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<?>> getTicket(
@PathVariable("id") Long id) {
return ResponseEntity.ok(ApiResponse.success(
ticketService.getById(id), "Ticket fetched"));
}
// PUT /api/tickets/{id}/status — TECH or ADMIN
@PutMapping("/{id}/status")
public ResponseEntity<ApiResponse<?>> updateStatus(
@PathVariable("id") Long id,
@RequestParam(name = "status") String status,
@RequestParam(name = "resolutionNote", required=false) String resolutionNote,
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.ok(ApiResponse.success(
ticketService.updateStatus(
id, status, resolutionNote, user),
"Status updated"));
}
// PUT /api/tickets/{id}/assign — ADMIN only
@PutMapping("/{id}/assign")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<?>> assign(
@PathVariable("id") Long id,
@RequestParam(name = "technicianId") Long technicianId) {
return ResponseEntity.ok(ApiResponse.success(
ticketService.assignTechnician(id, technicianId),
"Technician assigned"));
}// POST /api/tickets/{id}/comments — any authenticated user
@PostMapping("/{id}/comments")
public ResponseEntity<ApiResponse<?>> addComment(
@PathVariable("id") Long id,
@RequestParam(name = "content") String content,
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.status(HttpStatus.CREATED)
.body(ApiResponse.success(
commentService.addComment(id, content, user),
"Comment added"));
}
// PUT /api/tickets/{id}/comments/{cid} — owner/admin
@PutMapping("/{id}/comments/{cid}")
public ResponseEntity<ApiResponse<?>> updateComment(
@PathVariable("id") Long id,
@PathVariable("cid") Long cid,
@RequestParam(name = "content") String content,
Authentication auth) {
User user = (User) auth.getPrincipal();
return ResponseEntity.ok(ApiResponse.success(
commentService.updateComment(cid, content, user),
"Comment updated"));
}
// DELETE /api/tickets/{id}/comments/{cid} — owner only
@DeleteMapping("/{id}/comments/{cid}")
public ResponseEntity<ApiResponse<?>> deleteComment(
@PathVariable("id") Long id,
@PathVariable("cid") Long cid,
Authentication auth) {
User user = (User) auth.getPrincipal();
commentService.deleteComment(cid, user);
return ResponseEntity.ok(
ApiResponse.success(null, "Comment deleted"));
}
}