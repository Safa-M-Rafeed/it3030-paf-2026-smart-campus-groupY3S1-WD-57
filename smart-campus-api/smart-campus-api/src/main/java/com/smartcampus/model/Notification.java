package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {
<<<<<<< HEAD
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
=======

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    private String type;

    @Column(length = 500)
    private String message;

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
>>>>>>> b9829a34ac2c827600733d96cf2675c767dd9906
}