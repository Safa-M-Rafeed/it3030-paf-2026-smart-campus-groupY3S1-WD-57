package com.smartcampus.model;
import com.smartcampus.model.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "incident_tickets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentTicket {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
// Which facility/room this incident relates to
@Column(name = "facility_name")
private String facilityName;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "reported_by_id", nullable = false)
private User reportedBy;
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "assigned_technician_id")
private User assignedTechnician;
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private TicketCategory category;
@Column(nullable = false, length = 1000)
private String description;
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private TicketPriority priority;
@Enumerated(EnumType.STRING)
@Column(nullable = false)
@Builder.Default
private TicketStatus status = TicketStatus.OPEN;
private String contactDetails;
private String resolutionNote;

@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at")
private LocalDateTime updatedAt;

@OneToMany(mappedBy = "ticket",
cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<TicketAttachment> attachments = new ArrayList<>();
@OneToMany(mappedBy = "ticket",
cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<TicketComment> comments = new ArrayList<>();
}
