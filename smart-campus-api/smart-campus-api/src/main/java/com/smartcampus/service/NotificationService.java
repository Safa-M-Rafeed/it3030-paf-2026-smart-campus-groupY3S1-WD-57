package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Centralized method to send notifications.
     * Called by BookingService, TicketService, etc.
     */
    public void send(User recipient, String type, String message) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setMessage(message);
        
        // This persists the notification to the 'notifications' table
        notificationRepository.save(n);
    }
}