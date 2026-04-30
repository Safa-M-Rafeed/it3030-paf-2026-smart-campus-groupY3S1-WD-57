package com.smartcampus.smart_campus_api.booking.service;

import com.smartcampus.smart_campus_api.booking.service.BookingService;
import com.smartcampus.smart_campus_api.booking.dto.BookingRequestDto;
import com.smartcampus.smart_campus_api.booking.dto.BookingResponseDto;
import com.smartcampus.smart_campus_api.booking.entity.Booking;
import com.smartcampus.smart_campus_api.booking.enums.BookingStatus;
import com.smartcampus.smart_campus_api.booking.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponseDto createBooking(BookingRequestDto requestDto) {

        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())
                || requestDto.getStartTime().equals(requestDto.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                requestDto.getFacilityId(),
                requestDto.getDate(),
                requestDto.getStartTime(),
                requestDto.getEndTime(),
                List.of(BookingStatus.REJECTED, BookingStatus.CANCELLED));

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Booking conflict: selected time slot is already reserved");
        }

        Booking booking = new Booking();
        booking.setFacilityId(requestDto.getFacilityId());
        booking.setUserId(requestDto.getUserId());
        booking.setDate(requestDto.getDate());
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
        booking.setPurpose(requestDto.getPurpose());
        booking.setAttendees(requestDto.getAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponseDto> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<BookingResponseDto> getAllBookings(Long facilityId, BookingStatus status) {
        List<Booking> bookings;

        if (facilityId != null && status != null) {
            bookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getFacilityId().equals(facilityId) && b.getStatus() == status)
                    .toList();
        } else if (facilityId != null) {
            bookings = bookingRepository.findByFacilityId(facilityId);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public BookingResponseDto approveBooking(Long id) {
        Booking booking = findBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote("Approved by admin");

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    public BookingResponseDto rejectBooking(Long id, String reason) {
        Booking booking = findBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(reason);

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    public BookingResponseDto cancelBooking(Long id) {
        Booking booking = findBookingById(id);

        if (booking.getStatus() != BookingStatus.APPROVED
                && booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only approved or pending bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    private Booking findBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with id: " + id));
    }

    private BookingResponseDto mapToResponse(Booking booking) {
        BookingResponseDto responseDto = new BookingResponseDto();
        responseDto.setId(booking.getId());
        responseDto.setFacilityId(booking.getFacilityId());
        responseDto.setUserId(booking.getUserId());
        responseDto.setDate(booking.getDate());
        responseDto.setStartTime(booking.getStartTime());
        responseDto.setEndTime(booking.getEndTime());
        responseDto.setPurpose(booking.getPurpose());
        responseDto.setAttendees(booking.getAttendees());
        responseDto.setStatus(booking.getStatus());
        responseDto.setAdminNote(booking.getAdminNote());
        responseDto.setCreatedAt(booking.getCreatedAt());
        return responseDto;
    }
}