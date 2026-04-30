package com.smartcampus.controller;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.request.RoleUpdateDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
public class UserController {
@Autowired private UserRepository userRepo;
@GetMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<?>> getAllUsers() {
return ResponseEntity.ok(ApiResponse.success(
userRepo.findAll(), "All users"));
}
@PutMapping("/{id}/role")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<?>> changeRole(
@PathVariable("id") Long id,
@RequestBody RoleUpdateDto dto) {
User user = userRepo.findById(id).orElseThrow(
() -> new ResourceNotFoundException("User","id",id));
user.setRole(dto.getRole());
return ResponseEntity.ok(ApiResponse.success(
userRepo.save(user), "Role updated"));
}
}