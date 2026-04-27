package com.smartcampus.config;

import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.AuditTrailRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SystemHealthSampleDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final AuditTrailRepository auditTrailRepository;

    public SystemHealthSampleDataSeeder(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            AuditTrailRepository auditTrailRepository
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.auditTrailRepository = auditTrailRepository;
    }

    @Override
    public void run(String... args) {
        User admin = saveUserIfMissing("admin.health@campus.lk", "Health Admin", Role.ADMIN);
        User technician = saveUserIfMissing("tech.health@campus.lk", "Health Tech", Role.TECHNICIAN);
        User student = saveUserIfMissing("student.health@campus.lk", "Health Student", Role.USER);

        seedOldUnresolvedTickets(student, technician);
        seedPendingBookingEntries(admin);
    }

    private User saveUserIfMissing(String email, String name, Role role) {
        return userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .role(role)
                        .build()));
    }

    private void seedOldUnresolvedTickets(User reportedBy, User technician) {
        LocalDateTime now = LocalDateTime.now();

        List<IncidentTicket> samples = List.of(
                IncidentTicket.builder()
                        .facilityName("LAB-01")
                        .reportedBy(reportedBy)
                        .assignedTechnician(technician)
                        .category(TicketCategory.IT)
                        .description("Workstations in LAB-01 cannot access campus network.")
                        .priority(TicketPriority.HIGH)
                        .status(TicketStatus.OPEN)
                        .contactDetails("student.health@campus.lk")
                        .createdAt(now.minusDays(5))
                        .updatedAt(now.minusDays(4))
                        .build(),
                IncidentTicket.builder()
                        .facilityName("LH-A1")
                        .reportedBy(reportedBy)
                        .assignedTechnician(technician)
                        .category(TicketCategory.ELECTRICAL)
                        .description("Projector power issue in LH-A1 remains unresolved.")
                        .priority(TicketPriority.CRITICAL)
                        .status(TicketStatus.IN_PROGRESS)
                        .contactDetails("student.health@campus.lk")
                        .createdAt(now.minusDays(7))
                        .updatedAt(now.minusDays(6))
                        .build()
        );

        for (IncidentTicket sample : samples) {
            boolean exists = ticketRepository.findAll().stream()
                    .anyMatch(existing -> sample.getDescription().equals(existing.getDescription()));
            if (!exists) {
                ticketRepository.save(sample);
            }
        }
    }

    private void seedPendingBookingEntries(User admin) {
        LocalDateTime now = LocalDateTime.now();
        List<AuditTrailEntry> samples = List.of(
                AuditTrailEntry.builder()
                        .actor(admin.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3001")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Pending approval for seminar room reservation.")
                        .createdAt(now.minusHours(20))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(admin.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3002")
                        .oldValue(null)
                        .newValue("WAITING_APPROVAL")
                        .details("Pending approval for lab practical session.")
                        .createdAt(now.minusHours(12))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(admin.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3003")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Pending approval for evening workshop.")
                        .createdAt(now.minusHours(8))
                        .build()
        );

        for (AuditTrailEntry sample : samples) {
            if (!auditTrailRepository.existsByActionTypeAndTargetItem(sample.getActionType(), sample.getTargetItem())) {
                auditTrailRepository.save(sample);
            }
        }
    }
}
