package com.smartcampus.repository;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
public interface TicketRepository
extends JpaRepository<IncidentTicket, Long> {
// For USER: see only own tickets
List<IncidentTicket> findByReportedByIdOrderByCreatedAtDesc(
Long userId);
// For ADMIN: all tickets, optionally filtered by status
List<IncidentTicket> findByStatusOrderByCreatedAtDesc(
TicketStatus status);
// Tickets assigned to a specific technician
List<IncidentTicket> findByAssignedTechnicianId(
Long technicianId);

List<IncidentTicket> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}