package com.smartcampus.config;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AnalyticsSampleDataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    public AnalyticsSampleDataSeeder(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public void run(String... args) {
        seedResourcesIfEmpty();
    }

    private void seedResourcesIfEmpty() {
        LocalDateTime now = LocalDateTime.now();
        List<Resource> samples = List.of(
                buildResource("LAB-01", ResourceType.LAB, 35, "Engineering Block", ResourceStatus.ACTIVE, now),
                buildResource("LAB-02", ResourceType.LAB, 40, "Engineering Block", ResourceStatus.ACTIVE, now),
                buildResource("LH-A1", ResourceType.LECTURE_HALL, 120, "Main Building", ResourceStatus.ACTIVE, now),
                buildResource("LH-B3", ResourceType.LECTURE_HALL, 90, "Main Building", ResourceStatus.OUT_OF_SERVICE, now),
                buildResource("MR-12", ResourceType.MEETING_ROOM, 12, "Admin Wing", ResourceStatus.ACTIVE, now),
                buildResource("MR-14", ResourceType.MEETING_ROOM, 10, "Admin Wing", ResourceStatus.ACTIVE, now),
                buildResource("Projector-X1", ResourceType.EQUIPMENT, 1, "Stores", ResourceStatus.ACTIVE, now),
                buildResource("AudioKit-07", ResourceType.EQUIPMENT, 1, "Media Center", ResourceStatus.OUT_OF_SERVICE, now)
        );

        samples.forEach(this::saveIfMissing);
    }

    private void saveIfMissing(Resource resource) {
        if (resourceRepository.existsByName(resource.getName())) {
            return;
        }
        resourceRepository.save(resource);
    }

    private Resource buildResource(
            String name,
            ResourceType type,
            int capacity,
            String location,
            ResourceStatus status,
            LocalDateTime now
    ) {
        return Resource.builder()
                .name(name)
                .type(type)
                .capacity(capacity)
                .location(location)
                .description("Sample resource for analytics dashboard")
                .availabilityWindows(List.of("08:00-12:00", "13:00-17:00"))
                .status(status)
                .createdAt(now.minusDays(14))
                .updatedAt(now.minusDays(1))
                .build();
    }
}
