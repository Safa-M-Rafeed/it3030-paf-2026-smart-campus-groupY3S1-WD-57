package com.smartcampus.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus; // Required for the fix

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "incident_tickets")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class IncidentTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "facility_name")
    private String facilityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    // FIX: Stops User from trying to load all their tickets inside this ticket
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tickets"})
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tickets"})
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

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    // FIX: This stops the Attachment from loading the Ticket again in a loop
    @JsonIgnoreProperties("ticket")
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnoreProperties("ticket")
    private List<TicketComment> comments = new ArrayList<>();
}