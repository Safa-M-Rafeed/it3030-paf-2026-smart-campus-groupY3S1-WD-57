package com.smartcampus.service;

import com.smartcampus.dto.response.MostActiveUsersReportResponse;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.AuditTrailRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class MostActiveUsersReportService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final AuditTrailRepository auditTrailRepository;

    public MostActiveUsersReportService(
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

    public MostActiveUsersReportResponse getReport(String rangeType, LocalDate fromDate, LocalDate toDate) {
        DateWindow window = resolveDateWindow(rangeType, fromDate, toDate);
        LocalDateTime from = window.fromDate().atStartOfDay();
        LocalDateTime toExclusive = window.toDate().plusDays(1).atStartOfDay();

        Map<String, Aggregate> byEmail = new LinkedHashMap<>();

        List<AuditTrailEntry> bookings = auditTrailRepository.findByEntityAndActionTypeAndCreatedAtBetween(
                "BOOKING",
                "BOOKING_REQUESTED",
                from,
                toExclusive
        );
        for (AuditTrailEntry booking : bookings) {
            if (booking.getActor() == null || booking.getActor().isBlank()) continue;
            Aggregate aggregate = byEmail.computeIfAbsent(
                    booking.getActor().toLowerCase(Locale.ROOT),
                    email -> Aggregate.fromUser(userRepository.findByEmail(email).orElse(null), email)
            );
            aggregate.bookingsMade++;
            aggregate.touch(booking.getCreatedAt());
        }

        List<IncidentTicket> tickets = ticketRepository.findByCreatedAtBetween(from, toExclusive);
        for (IncidentTicket ticket : tickets) {
            User reporter = ticket.getReportedBy();
            if (reporter == null || reporter.getEmail() == null) continue;
            String email = reporter.getEmail().toLowerCase(Locale.ROOT);
            Aggregate aggregate = byEmail.computeIfAbsent(email, k -> Aggregate.fromUser(reporter, email));
            aggregate.ticketsCreated++;
            aggregate.touch(ticket.getCreatedAt());
        }

        List<TicketComment> comments = ticketCommentRepository.findByCreatedAtBetween(from, toExclusive);
        for (TicketComment comment : comments) {
            User author = comment.getAuthor();
            if (author == null || author.getEmail() == null) continue;
            String email = author.getEmail().toLowerCase(Locale.ROOT);
            Aggregate aggregate = byEmail.computeIfAbsent(email, k -> Aggregate.fromUser(author, email));
            aggregate.commentsPosted++;
            aggregate.touch(comment.getCreatedAt());
        }

        List<MostActiveUsersReportResponse.Row> rows = new ArrayList<>();
        for (Aggregate aggregate : byEmail.values()) {
            long total = aggregate.bookingsMade + aggregate.ticketsCreated + aggregate.commentsPosted;
            if (total == 0) continue;
            rows.add(MostActiveUsersReportResponse.Row.builder()
                    .name(aggregate.name)
                    .email(aggregate.email)
                    .bookingsMade(aggregate.bookingsMade)
                    .ticketsCreated(aggregate.ticketsCreated)
                    .commentsPosted(aggregate.commentsPosted)
                    .totalActions(total)
                    .lastActiveTime(aggregate.lastActiveTime)
                    .build());
        }

        rows.sort(Comparator
                .comparingLong(MostActiveUsersReportResponse.Row::getTotalActions).reversed()
                .thenComparing(MostActiveUsersReportResponse.Row::getLastActiveTime, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(MostActiveUsersReportResponse.Row::getEmail, Comparator.nullsLast(String::compareToIgnoreCase)));

        return MostActiveUsersReportResponse.builder()
                .fromDate(window.fromDate())
                .toDate(window.toDate())
                .rangeType(window.rangeType())
                .users(rows)
                .build();
    }

    public String toCsv(MostActiveUsersReportResponse report) {
        StringBuilder csv = new StringBuilder();
        csv.append("Rank,Name,Email,Bookings Made,Tickets Created,Comments Posted,Total Actions,Last Active Time\n");
        List<MostActiveUsersReportResponse.Row> rows = report.getUsers();
        for (int i = 0; i < rows.size(); i++) {
            MostActiveUsersReportResponse.Row row = rows.get(i);
            csv.append(i + 1).append(",")
                    .append(csvCell(row.getName())).append(",")
                    .append(csvCell(row.getEmail())).append(",")
                    .append(row.getBookingsMade()).append(",")
                    .append(row.getTicketsCreated()).append(",")
                    .append(row.getCommentsPosted()).append(",")
                    .append(row.getTotalActions()).append(",")
                    .append(csvCell(row.getLastActiveTime() == null ? "" : row.getLastActiveTime().toString()))
                    .append("\n");
        }
        return csv.toString();
    }

    private String csvCell(String value) {
        String safe = value == null ? "" : value;
        return "\"" + safe.replace("\"", "\"\"") + "\"";
    }

    private DateWindow resolveDateWindow(String rangeType, LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        String normalized = rangeType == null ? "this_week" : rangeType.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "this_month" -> new DateWindow(
                    "this_month",
                    today.withDayOfMonth(1),
                    today
            );
            case "custom" -> {
                LocalDate from = fromDate == null ? today.minusDays(6) : fromDate;
                LocalDate to = toDate == null ? today : toDate;
                if (from.isAfter(to)) {
                    LocalDate temp = from;
                    from = to;
                    to = temp;
                }
                yield new DateWindow("custom", from, to);
            }
            case "this_week" -> new DateWindow(
                    "this_week",
                    today.with(DayOfWeek.MONDAY),
                    today
            );
            default -> new DateWindow(
                    "this_week",
                    today.with(DayOfWeek.MONDAY),
                    today
            );
        };
    }

    private record DateWindow(String rangeType, LocalDate fromDate, LocalDate toDate) {}

    private static class Aggregate {
        private final String email;
        private final String name;
        private long bookingsMade;
        private long ticketsCreated;
        private long commentsPosted;
        private LocalDateTime lastActiveTime;

        private Aggregate(String email, String name) {
            this.email = email;
            this.name = name;
        }

        static Aggregate fromUser(User user, String fallbackEmail) {
            String email = fallbackEmail;
            String name = "Unknown User";
            if (user != null) {
                email = user.getEmail() == null ? fallbackEmail : user.getEmail();
                name = user.getName() == null || user.getName().isBlank() ? email : user.getName();
            }
            return new Aggregate(email, name);
        }

        void touch(LocalDateTime when) {
            if (when == null) return;
            if (lastActiveTime == null || when.isAfter(lastActiveTime)) {
                lastActiveTime = when;
            }
        }
    }
}
