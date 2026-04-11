package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // This tells Spring to manage this as a Bean
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Finds all notifications for a specific user, sorted by date (newest first)
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);
    
    // Returns the count of unread notifications for a user (useful for badges)
    long countByRecipientIdAndIsReadFalse(Long userId);
}