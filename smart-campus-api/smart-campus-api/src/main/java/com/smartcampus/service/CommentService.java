package com.smartcampus.service;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class CommentService {
@Autowired private TicketCommentRepository commentRepo;
@Autowired private TicketRepository ticketRepo;
// @Autowired private NotificationService notifService;
/** POST /api/tickets/{id}/comments */
public TicketComment addComment(
Long ticketId, String content, User author) {
IncidentTicket ticket = ticketRepo.findById(ticketId)
.orElseThrow(() -> new ResourceNotFoundException(
"Ticket","id",ticketId));
TicketComment comment = TicketComment.builder()
.ticket(ticket)
.author(author)
.content(content)
.build();
// Notify ticket owner of new comment:
// notifService.send(ticket.getReportedBy(),
// "NEW_COMMENT",
// "A new comment was added to your ticket.");
return commentRepo.save(comment);
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
public List<TicketComment> getCommentsForTicket(Long ticketId) {
return commentRepo
.findByTicketIdOrderByCreatedAtAsc(ticketId);
}
}