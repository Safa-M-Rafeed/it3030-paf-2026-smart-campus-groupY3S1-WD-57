package com.smartcampus.dto.response;

import com.smartcampus.model.enums.BookingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponseDto {

    public Long id;
    public Long facilityId;
    public Long userId;
    public LocalDate date;
    public LocalTime startTime;
    public LocalTime endTime;
    public String purpose;
    public Integer attendees;
    public BookingStatus status;
    public String adminNote;
    public LocalDateTime createdAt;
}