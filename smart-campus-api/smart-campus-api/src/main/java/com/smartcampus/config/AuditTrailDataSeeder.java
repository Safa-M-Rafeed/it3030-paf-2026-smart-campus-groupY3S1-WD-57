package com.smartcampus.config;

import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.repository.AuditTrailRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuditTrailDataSeeder implements CommandLineRunner {

    private final AuditTrailRepository auditTrailRepository;

    public AuditTrailDataSeeder(AuditTrailRepository auditTrailRepository) {
        this.auditTrailRepository = auditTrailRepository;
    }

    @Override
    public void run(String... args) {
        if (auditTrailRepository.count() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<AuditTrailEntry> samples = List.of(
                AuditTrailEntry.builder()
                        .actor("sliit.admin@campus.lk")
                        .actionType("BOOKING_APPROVED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-1042")
                        .oldValue("PENDING")
                        .newValue("APPROVED")
                        .details("Approved after schedule verification")
                        .createdAt(now.minusHours(6))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("tech.jay@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2281")
                        .oldValue("OPEN")
                        .newValue("IN_PROGRESS")
                        .details("Assigned technician started work")
                        .createdAt(now.minusHours(4))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("sliit.admin@campus.lk")
                        .actionType("RESOURCE_UPDATED")
                        .entity("RESOURCE")
                        .targetItem("Room LAB-02")
                        .oldValue("capacity=30")
                        .newValue("capacity=36")
                        .details("Updated after lab renovation")
                        .createdAt(now.minusHours(2))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("manager.ops@campus.lk")
                        .actionType("USER_LOGIN")
                        .entity("USER")
                        .targetItem("manager.ops@campus.lk")
                        .oldValue(null)
                        .newValue("SUCCESS")
                        .details("Authenticated via Google OAuth")
                        .createdAt(now.minusMinutes(45))
                        .build()
        );

        auditTrailRepository.saveAll(samples);
    }
}
