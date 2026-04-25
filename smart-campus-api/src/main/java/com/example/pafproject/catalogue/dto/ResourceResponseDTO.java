package com.example.pafproject.catalogue.dto;

import com.example.pafproject.catalogue.model.Resource;
import com.example.pafproject.catalogue.model.ResourceType;
import com.example.pafproject.catalogue.model.ResourceStatus;
import com.example.pafproject.catalogue.model.TimeSlot;
import java.time.LocalDateTime;
import java.util.List;

public class ResourceResponseDTO {

    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private List<TimeSlot> availabilityWindows;
    private ResourceStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ResourceResponseDTO() {}

    public ResourceResponseDTO(String id, String name, ResourceType type, int capacity,
                              String location, List<TimeSlot> availabilityWindows,
                              ResourceStatus status, String description,
                              LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindows = availabilityWindows;
        this.status = status;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static ResourceResponseDTO fromEntity(Resource resource) {
        return new ResourceResponseDTO(
            resource.getId(),
            resource.getName(),
            resource.getType(),
            resource.getCapacity(),
            resource.getLocation(),
            resource.getAvailabilityWindows(),
            resource.getStatus(),
            resource.getDescription(),
            resource.getCreatedAt(),
            resource.getUpdatedAt()
        );
    }
}
