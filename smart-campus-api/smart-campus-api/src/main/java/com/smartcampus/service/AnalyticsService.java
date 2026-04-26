package com.smartcampus.service;

import com.smartcampus.dto.response.AnalyticsDashboardResponse;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.AuditTrailRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AuditTrailRepository auditTrailRepository;
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;

    public AnalyticsService(
            AuditTrailRepository auditTrailRepository,
            TicketRepository ticketRepository,
            ResourceRepository resourceRepository
    ) {
        this.auditTrailRepository = auditTrailRepository;
        this.ticketRepository = ticketRepository;
        this.resourceRepository = resourceRepository;
    }

    public AnalyticsDashboardResponse getDashboard(LocalDate fromDate, LocalDate toDate) {
        LocalDate now = LocalDate.now();
        LocalDate effectiveFrom = fromDate == null ? now.minusDays(29) : fromDate;
        LocalDate effectiveTo = toDate == null ? now : toDate;
        if (effectiveFrom.isAfter(effectiveTo)) {
            LocalDate temp = effectiveFrom;
            effectiveFrom = effectiveTo;
            effectiveTo = temp;
        }

        LocalDateTime fromDateTime = effectiveFrom.atStartOfDay();
        LocalDateTime toDateTimeExclusive = effectiveTo.plusDays(1).atStartOfDay();

        List<AuditTrailEntry> auditEntries = auditTrailRepository
                .findByCreatedAtBetweenOrderByCreatedAtDesc(fromDateTime, toDateTimeExclusive);
        List<IncidentTicket> tickets = ticketRepository.findByCreatedAtBetween(fromDateTime, toDateTimeExclusive);
        List<Resource> resources = resourceRepository.findAll();

        return AnalyticsDashboardResponse.builder()
                .summary(buildSummary(auditEntries, tickets, resources, now))
                .peakBookingHours(buildPeakBookingHours(auditEntries))
                .incidentResolutionTrend(buildIncidentResolutionTrend(tickets, auditEntries, effectiveFrom, effectiveTo))
                .resourceTypeBreakdown(buildResourceTypeBreakdown(resources))
                .build();
    }

    private AnalyticsDashboardResponse.Summary buildSummary(
            List<AuditTrailEntry> auditEntries,
            List<IncidentTicket> tickets,
            List<Resource> resources,
            LocalDate now
    ) {
        LocalDate weekStart = now.with(DayOfWeek.MONDAY);
        long totalBookingsThisWeek = auditEntries.stream()
                .filter(entry -> entry.getCreatedAt() != null)
                .filter(entry -> !entry.getCreatedAt().toLocalDate().isBefore(weekStart))
                .filter(entry -> entry.getActionType() != null && entry.getActionType().startsWith("BOOKING_"))
                .count();

        long openTickets = tickets.stream()
                .filter(ticket -> ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS)
                .count();
        long resolvedTickets = tickets.stream()
                .filter(ticket -> ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED)
                .count();
        if (tickets.isEmpty()) {
            openTickets = auditEntries.stream()
                    .filter(entry -> "TICKET_STATUS_CHANGED".equals(entry.getActionType()))
                    .filter(entry -> "OPEN".equalsIgnoreCase(entry.getNewValue()) || "IN_PROGRESS".equalsIgnoreCase(entry.getNewValue()))
                    .count();
            resolvedTickets = auditEntries.stream()
                    .filter(entry -> "TICKET_STATUS_CHANGED".equals(entry.getActionType()))
                    .filter(entry -> "RESOLVED".equalsIgnoreCase(entry.getNewValue()) || "CLOSED".equalsIgnoreCase(entry.getNewValue()))
                    .count();
        }

        long totalResources = resources.size();
        long availableResources = resources.stream()
                .filter(resource -> resource.getStatus() == ResourceStatus.ACTIVE)
                .count();
        double availability = totalResources == 0 ? 0.0 : (availableResources * 100.0) / totalResources;

        return AnalyticsDashboardResponse.Summary.builder()
                .totalBookingsThisWeek(totalBookingsThisWeek)
                .openTickets(openTickets)
                .resolvedTickets(resolvedTickets)
                .resourceAvailabilityPercentage(Math.round(availability * 10.0) / 10.0)
                .build();
    }

    private List<AnalyticsDashboardResponse.BarPoint> buildPeakBookingHours(List<AuditTrailEntry> auditEntries) {
        Map<Integer, Long> countsByHour = new LinkedHashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            countsByHour.put(hour, 0L);
        }

        auditEntries.stream()
                .filter(entry -> entry.getActionType() != null && entry.getActionType().startsWith("BOOKING_"))
                .forEach(entry -> {
                    int hour = entry.getCreatedAt().getHour();
                    countsByHour.put(hour, countsByHour.get(hour) + 1);
                });

        return countsByHour.entrySet().stream()
                .map(e -> AnalyticsDashboardResponse.BarPoint.builder()
                        .hour(String.format("%02d:00", e.getKey()))
                        .count(e.getValue())
                        .build())
                .toList();
    }

    private List<AnalyticsDashboardResponse.LinePoint> buildIncidentResolutionTrend(
            List<IncidentTicket> tickets,
            List<AuditTrailEntry> auditEntries,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        Map<LocalDate, Long> byDate = new LinkedHashMap<>();
        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            byDate.put(date, 0L);
        }

        if (!tickets.isEmpty()) {
            tickets.stream()
                    .filter(ticket -> ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED)
                    .filter(ticket -> ticket.getUpdatedAt() != null)
                    .forEach(ticket -> {
                        LocalDate date = ticket.getUpdatedAt().toLocalDate();
                        if (byDate.containsKey(date)) {
                            byDate.put(date, byDate.get(date) + 1);
                        }
                    });
        } else {
            auditEntries.stream()
                    .filter(entry -> "TICKET_STATUS_CHANGED".equals(entry.getActionType()))
                    .filter(entry -> "RESOLVED".equalsIgnoreCase(entry.getNewValue()) || "CLOSED".equalsIgnoreCase(entry.getNewValue()))
                    .forEach(entry -> {
                        LocalDate date = entry.getCreatedAt().toLocalDate();
                        if (byDate.containsKey(date)) {
                            byDate.put(date, byDate.get(date) + 1);
                        }
                    });
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return byDate.entrySet().stream()
                .map(e -> AnalyticsDashboardResponse.LinePoint.builder()
                        .date(e.getKey().format(formatter))
                        .resolvedCount(e.getValue())
                        .build())
                .toList();
    }

    private List<AnalyticsDashboardResponse.PiePoint> buildResourceTypeBreakdown(List<Resource> resources) {
        Map<String, Long> byType = new LinkedHashMap<>();
        resources.forEach(resource -> {
            String type = resource.getType() == null ? "UNKNOWN" : resource.getType().name();
            byType.put(type, byType.getOrDefault(type, 0L) + 1);
        });

        return byType.entrySet().stream()
                .map(e -> AnalyticsDashboardResponse.PiePoint.builder()
                        .type(e.getKey())
                        .count(e.getValue())
                        .build())
                .toList();
    }
}
