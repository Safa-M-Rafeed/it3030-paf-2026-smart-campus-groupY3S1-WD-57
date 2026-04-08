package com.example.pafproject.catalogue.dto;

import com.example.pafproject.catalogue.model.Resource;
import com.example.pafproject.catalogue.model.ResourceType;
import com.example.pafproject.catalogue.model.ResourceStatus;
import com.example.pafproject.catalogue.model.TimeSlot;
import jakarta.validation.constraints.*;
import java.util.List;

public class ResourceRequestDTO {

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

    private ResourceStatus status;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<TimeSlot> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<TimeSlot> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Resource toEntity() {
        return Resource.builder()
            .name(this.name)
            .type(this.type)
            .capacity(this.capacity)
            .location(this.location)
            .availabilityWindows(this.availabilityWindows)
            .status(this.status)
            .description(this.description)
            .build();
    }
}
