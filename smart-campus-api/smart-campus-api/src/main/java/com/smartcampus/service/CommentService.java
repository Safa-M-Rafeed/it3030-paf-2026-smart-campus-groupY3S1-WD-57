package com.smartcampus.service;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class CommentService {
    @Autowired private NotificationService notifService;
    @Autowired private TicketCommentRepository commentRepo;
    @Autowired private TicketRepository ticketRepo;
// @Autowired private NotificationService notifService;
/** POST /api/tickets/{id}/comments */
public TicketComment addComment(Long ticketId, String content, User author) {
    // 1. Find the ticket
    IncidentTicket ticket = ticketRepo.findById(ticketId)
        .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

    // 2. Build the comment
    TicketComment comment = TicketComment.builder()
        .ticket(ticket)
        .author(author)
        .content(content)
        .build();

    // 3. Save the comment first
    TicketComment savedComment = commentRepo.save(comment);

    // 4. Send the notification (This is now reachable!)
    notifService.send(
        ticket.getReportedBy(), 
        "NEW_COMMENT", 
        "A new comment was added to your ticket #" + ticketId
    );

    // 5. Finally, return the saved object
    return savedComment;
}
/** DELETE /api/tickets/{id}/comments/{cid} — owner only */
public void deleteComment(Long commentId, User caller) {
TicketComment comment = commentRepo.findById(commentId)
.orElseThrow(() -> new ResourceNotFoundException(
"Comment","id",commentId));
boolean isOwner = comment.getAuthor().getId()
.equals(caller.getId());
boolean isAdmin = caller.getRole().name().equals("ADMIN");
if (!isOwner && !isAdmin)
throw new RuntimeException(
"You can only delete your own comments");
commentRepo.deleteById(commentId);
}

public TicketComment updateComment(Long commentId, String content, User caller) {
TicketComment comment = commentRepo.findById(commentId)
.orElseThrow(() -> new ResourceNotFoundException(
"Comment","id",commentId));
boolean isOwner = comment.getAuthor().getId()
.equals(caller.getId());
boolean isAdmin = caller.getRole().name().equals("ADMIN");
if (!isOwner && !isAdmin)
throw new RuntimeException(
"You can only edit your own comments");
if (content == null || content.isBlank())
throw new RuntimeException("Comment content cannot be empty");
comment.setContent(content);
return commentRepo.save(comment);
}

public List<TicketComment> getCommentsForTicket(Long ticketId) {
return commentRepo
.findByTicketIdOrderByCreatedAtAsc(ticketId);
}
}