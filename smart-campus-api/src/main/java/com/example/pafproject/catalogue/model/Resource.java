package com.example.pafproject.catalogue.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    @Size(max = 100, message = "Resource name must be less than 100 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be less than 200 characters")
    private String location;

    private List<TimeSlot> availabilityWindows;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
