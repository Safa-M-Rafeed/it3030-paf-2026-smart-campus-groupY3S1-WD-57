package com.smartcampus.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "ticket_comments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketComment {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ticket_id", nullable = false)
private IncidentTicket ticket;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "author_id", nullable = false)
private User author;
@Column(nullable = false, length = 1000)
private String content;
@Column(name = "created_at")
private LocalDateTime createdAt = LocalDateTime.now();
}
