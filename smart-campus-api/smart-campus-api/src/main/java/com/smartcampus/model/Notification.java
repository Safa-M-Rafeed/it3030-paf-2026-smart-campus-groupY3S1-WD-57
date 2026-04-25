package com.smartcampus.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "recipient_id", nullable = false)
private User recipient;
@Column(nullable = false)
private String type;
// BOOKING_APPROVED | BOOKING_REJECTED
// TICKET_UPDATE | NEW_COMMENT
@Column(nullable = false, length = 500)
private String message;
@Column(name = "is_read", nullable = false)
@Builder.Default
private boolean read = false;
@Column(name = "created_at")
@Builder.Default
private LocalDateTime createdAt = LocalDateTime.now();
}