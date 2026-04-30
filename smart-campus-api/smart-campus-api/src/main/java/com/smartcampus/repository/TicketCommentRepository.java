package com.smartcampus.repository;
import com.smartcampus.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
public interface TicketCommentRepository
extends JpaRepository<TicketComment, Long> {
List<TicketComment> findByTicketIdOrderByCreatedAtAsc(
Long ticketId);
List<TicketComment> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
