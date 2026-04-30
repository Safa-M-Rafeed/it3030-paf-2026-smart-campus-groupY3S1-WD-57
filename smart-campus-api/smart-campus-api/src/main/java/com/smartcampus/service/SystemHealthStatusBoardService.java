package com.smartcampus.service;

import com.smartcampus.dto.response.SystemHealthStatusBoardResponse;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SystemHealthStatusBoardService {

    private static final Set<TicketStatus> UNRESOLVED_TICKET_STATUSES = EnumSet.of(
            TicketStatus.OPEN,
            TicketStatus.IN_PROGRESS
    );

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final EntityManager entityManager;
    private final JdbcTemplate jdbcTemplate;

    public SystemHealthStatusBoardService(
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            TicketRepository ticketRepository,
            EntityManager entityManager,
            JdbcTemplate jdbcTemplate
    ) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.ticketRepository = ticketRepository;
        this.entityManager = entityManager;
        this.jdbcTemplate = jdbcTemplate;
    }

    public SystemHealthStatusBoardResponse getBoardData() {
        long totalUsers = userRepository.count();
        long totalResources = resourceRepository.count();
        long pendingBookings = calculatePendingBookings();
        long unresolvedTicketsOlderThan3Days = calculateUnresolvedTicketsOlderThan3Days();

        return SystemHealthStatusBoardResponse.builder()
                .totalUsersRegistered(totalUsers)
                .totalResources(totalResources)
                .pendingBookingsWaitingApproval(pendingBookings)
                .unresolvedTicketsOlderThan3Days(unresolvedTicketsOlderThan3Days)
                .databaseRecordCountsPerTable(fetchTableCounts())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private long calculatePendingBookings() {
        List<AuditTrailEntry> bookingEntries = entityManager.createQuery(
                        "SELECT a FROM AuditTrailEntry a WHERE a.entity = 'BOOKING' ORDER BY a.createdAt ASC",
                        AuditTrailEntry.class
                )
                .getResultList();

        Map<String, String> latestStatusByBooking = new LinkedHashMap<>();
        for (AuditTrailEntry entry : bookingEntries) {
            String key = entry.getTargetItem();
            String status = entry.getNewValue() != null ? entry.getNewValue() : entry.getOldValue();
            if (key != null && status != null) {
                latestStatusByBooking.put(key, status.trim().toUpperCase());
            }
        }

        return latestStatusByBooking.values().stream()
                .filter(status -> "PENDING".equals(status) || "WAITING_APPROVAL".equals(status))
                .count();
    }

    private long calculateUnresolvedTicketsOlderThan3Days() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(3);
        return ticketRepository.findAll().stream()
                .filter(ticket -> ticket.getCreatedAt() != null && ticket.getCreatedAt().isBefore(threshold))
                .filter(ticket -> ticket.getStatus() != null && UNRESOLVED_TICKET_STATUSES.contains(ticket.getStatus()))
                .count();
    }

    private Map<String, Long> fetchTableCounts() {
        List<String> tableNames = jdbcTemplate.queryForList(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
                String.class
        );

        Map<String, Long> tableCounts = new LinkedHashMap<>();
        for (String tableName : tableNames) {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"" + tableName + "\"",
                    Long.class
            );
            tableCounts.put(tableName, count == null ? 0L : count);
        }
        return tableCounts;
    }
}
