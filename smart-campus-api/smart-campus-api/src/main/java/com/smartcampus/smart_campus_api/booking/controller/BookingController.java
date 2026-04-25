package com.smartcampus.smart_campus_api.booking.controller;

import com.smartcampus.smart_campus_api.booking.dto.BookingRequestDto;
import com.smartcampus.smart_campus_api.booking.dto.BookingResponseDto;
import com.smartcampus.smart_campus_api.booking.dto.RejectBookingRequestDto;
import com.smartcampus.smart_campus_api.booking.enums.BookingStatus;
import com.smartcampus.smart_campus_api.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponseDto createBooking(@Valid @RequestBody BookingRequestDto requestDto) {
        return bookingService.createBooking(requestDto);
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
            @Valid @RequestBody RejectBookingRequestDto requestDto) {
        return bookingService.rejectBooking(id, requestDto.getReason());
    }

    @PutMapping("/{id}/cancel")
    public BookingResponseDto cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}