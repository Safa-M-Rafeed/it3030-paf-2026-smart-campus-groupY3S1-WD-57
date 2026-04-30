package com.smartcampus.config;

import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.AuditTrailRepository;
import com.smartcampus.repository.TicketCommentRepository;
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
    private final TicketCommentRepository ticketCommentRepository;
    private final AuditTrailRepository auditTrailRepository;

    public SystemHealthSampleDataSeeder(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            TicketCommentRepository ticketCommentRepository,
            AuditTrailRepository auditTrailRepository
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.auditTrailRepository = auditTrailRepository;
    }

    @Override
    public void run(String... args) {
        User admin = saveUserIfMissing("admin.health@campus.lk", "Health Admin", Role.ADMIN);
        User technician = saveUserIfMissing("tech.health@campus.lk", "Health Tech", Role.TECHNICIAN);
        User student = saveUserIfMissing("student.health@campus.lk", "Health Student", Role.USER);
        User manager = saveUserIfMissing("manager.health@campus.lk", "Health Manager", Role.MANAGER);

        List<IncidentTicket> tickets = seedOldUnresolvedTickets(student, technician);
        seedPendingBookingEntries(admin, student, manager);
        seedSampleComments(tickets, technician, manager);
    }

    private User saveUserIfMissing(String email, String name, Role role) {
        return userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .role(role)
                        .build()));
    }

    private List<IncidentTicket> seedOldUnresolvedTickets(User reportedBy, User technician) {
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
                        .build(),
                IncidentTicket.builder()
                        .facilityName("MR-12")
                        .reportedBy(reportedBy)
                        .assignedTechnician(technician)
                        .category(TicketCategory.IT)
                        .description("Printer connectivity issue reported today.")
                        .priority(TicketPriority.MEDIUM)
                        .status(TicketStatus.OPEN)
                        .contactDetails("student.health@campus.lk")
                        .createdAt(now.minusHours(6))
                        .updatedAt(now.minusHours(3))
                        .build(),
                IncidentTicket.builder()
                        .facilityName("LAB-02")
                        .reportedBy(reportedBy)
                        .assignedTechnician(technician)
                        .category(TicketCategory.OTHER)
                        .description("Air conditioning issue recorded earlier this month.")
                        .priority(TicketPriority.LOW)
                        .status(TicketStatus.IN_PROGRESS)
                        .contactDetails("student.health@campus.lk")
                        .createdAt(now.minusDays(18))
                        .updatedAt(now.minusDays(16))
                        .build(),
                IncidentTicket.builder()
                        .facilityName("LH-B3")
                        .reportedBy(reportedBy)
                        .assignedTechnician(technician)
                        .category(TicketCategory.ELECTRICAL)
                        .description("Legacy lighting issue for custom date testing.")
                        .priority(TicketPriority.HIGH)
                        .status(TicketStatus.OPEN)
                        .contactDetails("student.health@campus.lk")
                        .createdAt(now.minusDays(42))
                        .updatedAt(now.minusDays(40))
                        .build()
        );

        for (IncidentTicket sample : samples) {
            boolean exists = ticketRepository.findAll().stream()
                    .anyMatch(existing -> sample.getDescription().equals(existing.getDescription()));
            if (!exists) {
                ticketRepository.save(sample);
            }
        }
        return ticketRepository.findAll().stream()
                .filter(ticket -> samples.stream().anyMatch(sample -> sample.getDescription().equals(ticket.getDescription())))
                .toList();
    }

    private void seedPendingBookingEntries(User admin, User student, User manager) {
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
                        .actor(student.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3002")
                        .oldValue(null)
                        .newValue("WAITING_APPROVAL")
                        .details("Pending approval for lab practical session.")
                        .createdAt(now.minusHours(12))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(manager.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3003")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Pending approval for evening workshop.")
                        .createdAt(now.minusHours(8))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(student.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3004")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Booking request submitted this morning.")
                        .createdAt(now.minusHours(3))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(manager.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3005")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Booking request submitted this week.")
                        .createdAt(now.minusDays(2))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(admin.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3006")
                        .oldValue(null)
                        .newValue("WAITING_APPROVAL")
                        .details("Booking request submitted this month.")
                        .createdAt(now.minusDays(10))
                        .build(),
                AuditTrailEntry.builder()
                        .actor(student.getEmail())
                        .actionType("BOOKING_REQUESTED")
                        .entity("BOOKING")
                        .targetItem("Booking #BK-3007")
                        .oldValue(null)
                        .newValue("PENDING")
                        .details("Older booking request for custom range testing.")
                        .createdAt(now.minusDays(35))
                        .build()
        );

        for (AuditTrailEntry sample : samples) {
            if (!auditTrailRepository.existsByActionTypeAndTargetItem(sample.getActionType(), sample.getTargetItem())) {
                auditTrailRepository.save(sample);
            }
        }
    }

    private void seedSampleComments(List<IncidentTicket> tickets, User technician, User manager) {
        if (tickets.isEmpty()) return;
        LocalDateTime now = LocalDateTime.now();

        List<TicketComment> samples = List.of(
                TicketComment.builder()
                        .ticket(tickets.get(0))
                        .author(technician)
                        .content("Initial diagnosis completed. Awaiting replacement parts.")
                        .createdAt(now.minusDays(4))
                        .build(),
                TicketComment.builder()
                        .ticket(tickets.get(0))
                        .author(manager)
                        .content("Please prioritize this issue before next lab session.")
                        .createdAt(now.minusDays(3))
                        .build(),
                TicketComment.builder()
                        .ticket(tickets.get(0))
                        .author(technician)
                        .content("Update posted today after diagnostics follow-up.")
                        .createdAt(now.minusHours(5))
                        .build(),
                TicketComment.builder()
                        .ticket(tickets.get(0))
                        .author(manager)
                        .content("Monthly review note added for reporting.")
                        .createdAt(now.minusDays(14))
                        .build()
        );

        for (TicketComment sample : samples) {
            boolean exists = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(sample.getTicket().getId()).stream()
                    .anyMatch(existing -> existing.getContent().equals(sample.getContent()));
            if (!exists) {
                ticketCommentRepository.save(sample);
            }
        }
    }
}
