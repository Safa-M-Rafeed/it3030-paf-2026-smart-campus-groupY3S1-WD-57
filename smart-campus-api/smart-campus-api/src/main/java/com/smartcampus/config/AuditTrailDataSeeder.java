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
                        .actor("tech.jay@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2281")
                        .oldValue("IN_PROGRESS")
                        .newValue("RESOLVED")
                        .details("Issue fixed and verified")
                        .createdAt(now.minusHours(3))
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
                        .actor("sliit.admin@campus.lk")
                        .actionType("BOOKING_APPROVED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-1048")
                        .oldValue("PENDING")
                        .newValue("APPROVED")
                        .details("Peak-hour class booking")
                        .createdAt(now.minusHours(9))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("sliit.admin@campus.lk")
                        .actionType("BOOKING_APPROVED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-1053")
                        .oldValue("PENDING")
                        .newValue("APPROVED")
                        .details("Lab booking during afternoon peak")
                        .createdAt(now.minusHours(26))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("sliit.admin@campus.lk")
                        .actionType("BOOKING_REJECTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-1054")
                        .oldValue("PENDING")
                        .newValue("REJECTED")
                        .details("Rejected due to unavailable room")
                        .createdAt(now.minusHours(30))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("sliit.admin@campus.lk")
                        .actionType("BOOKING_APPROVED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-1061")
                        .oldValue("PENDING")
                        .newValue("APPROVED")
                        .details("Morning booking approved")
                        .createdAt(now.minusHours(54))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("tech.ravi@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2287")
                        .oldValue("OPEN")
                        .newValue("IN_PROGRESS")
                        .details("Technician started diagnosis")
                        .createdAt(now.minusHours(50))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("tech.ravi@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2287")
                        .oldValue("IN_PROGRESS")
                        .newValue("CLOSED")
                        .details("Repair completed and closed")
                        .createdAt(now.minusHours(44))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("tech.nila@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2290")
                        .oldValue("OPEN")
                        .newValue("IN_PROGRESS")
                        .details("Networking issue under investigation")
                        .createdAt(now.minusHours(20))
                        .build(),
                AuditTrailEntry.builder()
                        .actor("tech.nila@campus.lk")
                        .actionType("TICKET_STATUS_CHANGED")
                        .entity("TICKET")
                        .targetItem("Ticket #TK-2290")
                        .oldValue("IN_PROGRESS")
                        .newValue("RESOLVED")
                        .details("Switch port replaced")
                        .createdAt(now.minusHours(16))
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

        samples.forEach(this::saveIfMissing);
    }

    private void saveIfMissing(AuditTrailEntry entry) {
        if (auditTrailRepository.existsByActionTypeAndTargetItem(entry.getActionType(), entry.getTargetItem())) {
            return;
        }
        auditTrailRepository.save(entry);
    }
}
