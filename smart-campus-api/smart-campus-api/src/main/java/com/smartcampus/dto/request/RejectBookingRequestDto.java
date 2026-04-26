package com.smartcampus.dto.request;

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