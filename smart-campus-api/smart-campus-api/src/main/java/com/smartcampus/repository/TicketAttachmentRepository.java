package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Add this
import java.util.List;

@Repository // Add this
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    
    // This looks for 'ticket_id' in the database
    List<TicketAttachment> findByTicketId(Long ticketId);
    
    // Note: deleteByTicketId requires @Transactional in your Service
    void deleteByTicketId(Long ticketId);
}