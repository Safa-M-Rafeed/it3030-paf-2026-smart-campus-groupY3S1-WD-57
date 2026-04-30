package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequestDto;
import com.smartcampus.dto.request.RejectBookingRequestDto;
import com.smartcampus.dto.response.BookingResponseDto;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    public BookingResponseDto createBooking(@Valid @RequestBody BookingRequestDto dto) {
        return bookingService.createBooking(dto);
    }

    @GetMapping("/my")
    public List<BookingResponseDto> getMyBookings(@RequestParam Long userId) {
        return bookingService.getMyBookings(userId);
    }

    @GetMapping
    public List<BookingResponseDto> getAllBookings(
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) BookingStatus status) {
        return bookingService.getAllBookings(facilityId, status);
    }

    @PutMapping("/{id}/approve")
    public BookingResponseDto approveBooking(@PathVariable Long id) {
        return bookingService.approveBooking(id);
    }

    @PutMapping("/{id}/reject")
    public BookingResponseDto rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequestDto dto) {
        return bookingService.rejectBooking(id, dto.getReason());
    }

    @PutMapping("/{id}/cancel")
    public BookingResponseDto cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}