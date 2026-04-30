package com.smartcampus.config;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class BookingDataSeeder implements CommandLineRunner {

    private final BookingRepository bookingRepository;

    public BookingDataSeeder(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        seedBookingsIfEmpty();
    }

    private void seedBookingsIfEmpty() {
        if (bookingRepository.count() > 0) {
            return;
        }

        LocalDate today = LocalDate.now();

        List<Booking> sampleBookings = List.of(
                // Meeting room bookings
                buildBooking(1L, 1L, today, LocalTime.of(9, 0), LocalTime.of(10, 30), 
                        "Project Planning Meeting", 8, BookingStatus.APPROVED, "Team meeting for Q1 planning"),
                
                buildBooking(2L, 2L, today.plusDays(1), LocalTime.of(14, 0), LocalTime.of(15, 30), 
                        "Client Presentation", 12, BookingStatus.APPROVED, "Confirmed by admin"),
                
                buildBooking(3L, 3L, today.plusDays(2), LocalTime.of(10, 0), LocalTime.of(11, 30), 
                        "Department Review", 15, BookingStatus.PENDING, null),
                
                // Lab bookings
                buildBooking(4L, 4L, today.plusDays(3), LocalTime.of(13, 0), LocalTime.of(15, 0), 
                        "Computer Science Lab Session", 25, BookingStatus.APPROVED, "Lab equipment checked"),
                
                buildBooking(5L, 5L, today.plusDays(4), LocalTime.of(11, 0), LocalTime.of(13, 0), 
                        "Electronics Lab Experiment", 20, BookingStatus.APPROVED, "Safety protocols verified"),
                
                // Lecture hall bookings
                buildBooking(6L, 6L, today.plusDays(5), LocalTime.of(9, 0), LocalTime.of(11, 0), 
                        "Advanced Database Systems Lecture", 100, BookingStatus.APPROVED, "Projector and audio setup confirmed"),
                
                buildBooking(7L, 7L, today.plusDays(6), LocalTime.of(14, 0), LocalTime.of(16, 0), 
                        "Software Engineering Seminar", 85, BookingStatus.PENDING, null),
                
                // Workshop bookings
                buildBooking(8L, 8L, today.plusDays(7), LocalTime.of(10, 0), LocalTime.of(12, 30), 
                        "Web Development Workshop", 30, BookingStatus.REJECTED, "Facility unavailable on that date"),
                
                buildBooking(9L, 9L, today.plusDays(8), LocalTime.of(15, 0), LocalTime.of(17, 0), 
                        "Cloud Computing Training", 40, BookingStatus.APPROVED, "External trainer confirmed"),
                
                // Additional meeting room bookings
                buildBooking(10L, 10L, today.plusDays(9), LocalTime.of(11, 0), LocalTime.of(12, 30), 
                        "Budget Review Committee", 18, BookingStatus.APPROVED, "Finance team notified"),
                
                buildBooking(1L, 11L, today.plusDays(10), LocalTime.of(16, 0), LocalTime.of(17, 30), 
                        "Staff Performance Appraisal", 4, BookingStatus.PENDING, null),
                
                buildBooking(2L, 12L, today.plusDays(11), LocalTime.of(13, 30), LocalTime.of(15, 0), 
                        "Alumni Networking Event", 60, BookingStatus.APPROVED, "Refreshments arranged"),
                
                buildBooking(3L, 13L, today.plusDays(12), LocalTime.of(10, 0), LocalTime.of(11, 30), 
                        "Research Team Sync", 7, BookingStatus.APPROVED, "Lab equipment reserved"),
                
                buildBooking(4L, 14L, today.plusDays(13), LocalTime.of(14, 30), LocalTime.of(16, 30), 
                        "Student Club Meeting", 22, BookingStatus.PENDING, null),
                
                buildBooking(5L, 15L, today.plusDays(14), LocalTime.of(9, 30), LocalTime.of(11, 0), 
                        "Curriculum Development Workshop", 25, BookingStatus.APPROVED, "Teaching materials prepared")
        );

        sampleBookings.forEach(bookingRepository::save);
    }

    private Booking buildBooking(Long facilityId, Long userId, LocalDate date, 
                                  LocalTime startTime, LocalTime endTime, String purpose, 
                                  Integer attendees, BookingStatus status, String adminNote) {
        Booking booking = new Booking();
        booking.setFacilityId(facilityId);
        booking.setUserId(userId);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setAttendees(attendees);
        booking.setStatus(status);
        booking.setAdminNote(adminNote);
        return booking;
    }
}
