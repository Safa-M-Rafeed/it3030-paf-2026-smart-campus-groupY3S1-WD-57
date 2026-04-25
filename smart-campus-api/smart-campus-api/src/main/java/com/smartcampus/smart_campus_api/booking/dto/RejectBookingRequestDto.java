package com.smartcampus.smart_campus_api.booking.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectBookingRequestDto {

    @NotBlank(message = "Reject reason is required")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}