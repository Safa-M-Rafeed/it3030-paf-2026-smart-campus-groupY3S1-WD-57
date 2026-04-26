package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.model.enums.*;
import com.smartcampus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.util.List;

 
@Service
public class TicketService {
    @Autowired private NotificationService notifService;
    @Autowired private TicketRepository ticketRepo;
    @Autowired private TicketAttachmentRepository attachRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private FileStorageService fileStorage;

    // Injected by Member 4 — used in Steps 12/16:
    // @Autowired private NotificationService notifService;

    /** POST /api/tickets — create new ticket with attachments */
    @Transactional
    public IncidentTicket createTicket(
            String facilityName,
            String category,
            String description,
            String priority,
            String contactDetails,
            User reporter,
            List<MultipartFile> files) throws IOException {

        // FIX: Changed .Builder() to .builder()
        IncidentTicket ticket = IncidentTicket.builder()
                .facilityName(facilityName)
                .reportedBy(reporter)
                .category(TicketCategory.valueOf(category.toUpperCase()))
                .description(description)
                .priority(TicketPriority.valueOf(priority.toUpperCase()))
                .contactDetails(contactDetails)
                .status(TicketStatus.OPEN)
                .build();

        ticketRepo.save(ticket);

        // Save attachments if provided
        if (files != null && !files.isEmpty()) {
            List<String> paths = fileStorage.saveFiles(files);
            for (int i = 0; i < paths.size(); i++) {
                MultipartFile f = files.get(i);
                
                // FIX: Changed .Builder() to .builder()
                TicketAttachment att = TicketAttachment.builder()
                        .ticket(ticket)
                        .filePath(paths.get(i))
                        .originalFileName(f.getOriginalFilename())
                        .contentType(f.getContentType())
                        .build();
                
                attachRepo.save(att);
            }
        }
        return ticket;
    }

    /** GET — list tickets (own or all) */
    public List<IncidentTicket> getTickets(User caller, String statusFilter) {
        String role = caller.getRole().name();
        
        if (role.equals("ADMIN")) {
            if (statusFilter != null && !statusFilter.isBlank())
                return ticketRepo.findByStatusOrderByCreatedAtDesc(
                        TicketStatus.valueOf(statusFilter.toUpperCase()));
            return ticketRepo.findAll();
        }
        
        if (role.equals("TECHNICIAN"))
            return ticketRepo.findByAssignedTechnicianId(caller.getId());
            
        return ticketRepo.findByReportedByIdOrderByCreatedAtDesc(caller.getId());
    }

    /** GET /{id} — single ticket detail */
    public IncidentTicket getById(Long id) {
        return ticketRepo.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Ticket", "id", id));
    }

    /** PUT /{id}/status — update status + resolution note */
    @Transactional
    public IncidentTicket updateStatus(Long id, String newStatus, String resolutionNote, User caller) {
        IncidentTicket ticket = getById(id);

        boolean isAdmin = caller.getRole().name().equals("ADMIN");
        boolean isTech = ticket.getAssignedTechnician() != null &&
                         ticket.getAssignedTechnician().getId().equals(caller.getId());
        
        if (!isAdmin && !isTech)
            throw new RuntimeException("Not authorised to update this ticket");

        ticket.setStatus(TicketStatus.valueOf(newStatus.toUpperCase()));
        if (resolutionNote != null && !resolutionNote.isBlank())
            ticket.setResolutionNote(resolutionNote);

        // 1. Save the ticket first
        IncidentTicket updatedTicket = ticketRepo.save(ticket);

        // 2. Send the notification (This must come BEFORE the return)
        notifService.send(
            ticket.getReportedBy(),
            "TICKET_UPDATE",
            "Your ticket #" + id + " status changed to " + newStatus
        );

        // 3. Finally return the object
        return updatedTicket;
    }

    /** PUT /{id}/assign — assign technician (ADMIN only) */
    @Transactional
    public IncidentTicket assignTechnician(Long ticketId, Long technicianId) {
        IncidentTicket ticket = getById(ticketId);
        User tech = userRepo.findById(technicianId).orElseThrow(
                () -> new ResourceNotFoundException("User", "id", technicianId));
        
        ticket.setAssignedTechnician(tech);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return ticketRepo.save(ticket);
    }

    /** DELETE /{id} — owner or ADMIN may delete */
    @Transactional
    public void deleteTicket(Long id, User caller) {
        IncidentTicket ticket = getById(id);

        boolean isAdmin = caller.getRole().name().equals("ADMIN");
        boolean isOwner = ticket.getReportedBy().getId().equals(caller.getId());
        
        if (!isAdmin && !isOwner)
            throw new RuntimeException("Not authorised to delete this ticket");

        // Delete files from disk
        if (ticket.getAttachments() != null) {
            ticket.getAttachments().forEach(a -> fileStorage.deleteFile(a.getFilePath()));
        }
        
        ticketRepo.delete(ticket);
    }
}