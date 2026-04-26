package com.smartcampus.model;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;

    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;

    @Builder.Default
    private List<String> availabilityWindows = new ArrayList<>();

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
