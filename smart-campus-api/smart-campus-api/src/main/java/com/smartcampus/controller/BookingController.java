package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequestDto;
import com.smartcampus.dto.request.RejectBookingRequestDto;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.BookingResponseDto;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(
            @Valid @RequestBody BookingRequestDto dto,
            Authentication auth) {
        User actor = extractUser(auth);
        BookingResponseDto created = bookingService.createBooking(dto, actor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Booking request created"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getMyBookings(Authentication auth) {
        User actor = extractUser(auth);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookings(actor), "My bookings fetched"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getAllBookings(
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) BookingStatus status,
            Authentication auth) {
        User actor = extractUser(auth);
        if (actor.getRole() != com.smartcampus.model.enums.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
        }
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getAllBookings(facilityId, status),
                "All bookings fetched"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponseDto>> approveBooking(@PathVariable Long id, Authentication auth) {
        User actor = extractUser(auth);
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.approveBooking(id, actor),
                "Booking approved"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponseDto>> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequestDto dto,
            Authentication auth) {
        User actor = extractUser(auth);
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.rejectBooking(id, dto.getReason(), actor),
                "Booking rejected"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(@PathVariable Long id, Authentication auth) {
        User actor = extractUser(auth);
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.cancelBooking(id, actor),
                "Booking cancelled"));
    }

    private User extractUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return user;
    }
}