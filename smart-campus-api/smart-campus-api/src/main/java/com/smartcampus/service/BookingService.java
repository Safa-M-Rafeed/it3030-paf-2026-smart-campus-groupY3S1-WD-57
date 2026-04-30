package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequestDto;
import com.smartcampus.dto.response.BookingResponseDto;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.BookingRepository;
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

    public BookingResponseDto createBooking(BookingRequestDto dto, User actor) {
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getFacilityId(),
                dto.getDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                List.of(BookingStatus.REJECTED, BookingStatus.CANCELLED));

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Booking conflict: selected time slot is already reserved");
        }

        Booking booking = new Booking();
        booking.setFacilityId(dto.getFacilityId());
        booking.setUserId(actor.getId());
        booking.setDate(dto.getDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setAttendees(dto.getAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponseDto> getMyBookings(User actor) {
        return bookingRepository.findByUserId(actor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<BookingResponseDto> getAllBookings(Long facilityId, BookingStatus status) {
        List<Booking> bookings;

        if (facilityId != null) {
            bookings = bookingRepository.findByFacilityId(facilityId);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .filter(b -> status == null || b.getStatus() == status)
                .map(this::mapToResponse)
                .toList();
    }

    public BookingResponseDto approveBooking(Long id, User actor) {
        ensureAdmin(actor);
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote("Approved by admin");
        return mapToResponse(bookingRepository.save(booking));
    }

    public BookingResponseDto rejectBooking(Long id, String reason, User actor) {
        ensureAdmin(actor);
        Booking booking = findBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(reason);
        return mapToResponse(bookingRepository.save(booking));
    }

    public BookingResponseDto cancelBooking(Long id, User actor) {
        Booking booking = findBooking(id);
        boolean isOwner = actor.getId().equals(booking.getUserId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only APPROVED bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponse(bookingRepository.save(booking));
    }

    private void ensureAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
        }
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private BookingResponseDto mapToResponse(Booking b) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.id = b.getId();
        dto.facilityId = b.getFacilityId();
        dto.userId = b.getUserId();
        dto.date = b.getDate();
        dto.startTime = b.getStartTime();
        dto.endTime = b.getEndTime();
        dto.purpose = b.getPurpose();
        dto.attendees = b.getAttendees();
        dto.status = b.getStatus();
        dto.adminNote = b.getAdminNote();
        dto.createdAt = b.getCreatedAt();
        return dto;
    }
}