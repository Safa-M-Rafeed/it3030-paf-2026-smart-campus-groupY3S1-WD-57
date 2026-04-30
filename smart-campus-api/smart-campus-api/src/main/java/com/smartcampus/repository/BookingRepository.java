package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByFacilityId(Long facilityId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("""
                SELECT b FROM Booking b
                WHERE b.facilityId = :facilityId
                  AND b.date = :date
                  AND b.status NOT IN (:ignoredStatuses)
                  AND b.startTime < :endTime
                  AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookings(
            @Param("facilityId") Long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("ignoredStatuses") List<BookingStatus> ignoredStatuses);
}