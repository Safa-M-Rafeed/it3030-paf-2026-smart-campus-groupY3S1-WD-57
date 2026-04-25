package com.smartcampus.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "ticket_attachments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketAttachment {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ticket_id", nullable = false)
private IncidentTicket ticket;
// Relative path stored in DB: e.g. 'uploads/abc123.jpg'
@Column(name = "file_path", nullable = false)
private String filePath;
@Column(name = "original_file_name")
private String originalFileName;
@Column(name = "content_type")
private String contentType;
@Column(name = "uploaded_at")
private LocalDateTime uploadedAt = LocalDateTime.now();
}
