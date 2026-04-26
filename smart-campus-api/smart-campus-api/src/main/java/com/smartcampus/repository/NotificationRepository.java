package com.smartcampus.repository;
import com.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface NotificationRepository
extends MongoRepository<Notification, String> {
List<Notification> findByRecipientIdOrderByCreatedAtDesc(
String userId);
long countByRecipientIdAndReadFalse(String userId);
}