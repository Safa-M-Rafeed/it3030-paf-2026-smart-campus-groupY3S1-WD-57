package com.smartcampus.dto.request;

import com.smartcampus.model.enums.NotificationEventType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationEventRequest {

    @NotNull
    private Long recipientUserId;

    @NotNull
    private NotificationEventType eventType;

    private String reference;
    private String details;
}
