package com.smartcampus.service;

import com.smartcampus.dto.request.NotificationEventRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.NotificationEventType;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    @Autowired
    private UserRepository userRepository;

    public void send(User recipient, String type, String msg) {

        Notification n = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(msg)
                .build();

        repo.save(n);
    }

    public List<Notification> getForUser(Long userId) {
        return repo.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public Notification markRead(Long id, Long actorUserId) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!n.getRecipient().getId().equals(actorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only mark your own notifications.");
        }

        n.setRead(true);
        return repo.save(n);
    }

    public void markAllRead(Long userId) {
        List<Notification> list = repo.findByRecipientIdOrderByCreatedAtDesc(userId);
        list.forEach(n -> n.setRead(true));
        repo.saveAll(list);
    }

    public void delete(Long id, Long actorUserId) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!n.getRecipient().getId().equals(actorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own notifications.");
        }
        repo.deleteById(id);
    }

    public Notification triggerEvent(NotificationEventRequest req, User actor) {
        User recipient = userRepository.findById(req.getRecipientUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", req.getRecipientUserId()));

        String reference = req.getReference() == null ? "" : (" [" + req.getReference() + "]");
        String details = req.getDetails() == null ? "" : (" - " + req.getDetails());
        String actorName = actor.getName() == null || actor.getName().isBlank() ? actor.getEmail() : actor.getName();

        String message = switch (req.getEventType()) {
            case BOOKING_APPROVED -> "Your booking was approved by " + actorName + reference + details;
            case BOOKING_REJECTED -> "Your booking was rejected by " + actorName + reference + details;
            case TICKET_STATUS_CHANGED -> "Your ticket status changed by " + actorName + reference + details;
            case TICKET_COMMENT_ADDED -> "New comment on your ticket from " + actorName + reference + details;
        };

        Notification n = Notification.builder()
                .recipient(recipient)
                .type(req.getEventType().name())
                .message(message)
                .build();
        return repo.save(n);
    }

    public List<Notification> seedDemoNotificationsForUser(User actor) {
        String actorName = actor.getName() == null || actor.getName().isBlank() ? actor.getEmail() : actor.getName();

        List<Notification> demo = List.of(
                Notification.builder()
                        .recipient(actor)
                        .type(NotificationEventType.BOOKING_APPROVED.name())
                        .message("Your booking was approved by " + actorName + " [BK-104] - Lab 3 access confirmed")
                        .build(),
                Notification.builder()
                        .recipient(actor)
                        .type(NotificationEventType.BOOKING_REJECTED.name())
                        .message("Your booking was rejected by " + actorName + " [BK-102] - Timeslot conflict")
                        .build(),
                Notification.builder()
                        .recipient(actor)
                        .type(NotificationEventType.TICKET_STATUS_CHANGED.name())
                        .message("Your ticket status changed by " + actorName + " [TK-221] - Marked as IN_PROGRESS")
                        .build(),
                Notification.builder()
                        .recipient(actor)
                        .type(NotificationEventType.TICKET_COMMENT_ADDED.name())
                        .message("New comment on your ticket from " + actorName + " [TK-221] - Technician requested logs")
                        .build()
        );

        return repo.saveAll(demo).stream().filter(Objects::nonNull).toList();
    }
}