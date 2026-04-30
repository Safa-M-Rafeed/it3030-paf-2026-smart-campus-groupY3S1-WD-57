package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.repository.AuditTrailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditTrailService {

    private final AuditTrailRepository auditTrailRepository;

    public AuditTrailService(AuditTrailRepository auditTrailRepository) {
        this.auditTrailRepository = auditTrailRepository;
    }

    public AuditTrailEntry logEvent(
            String actor,
            String actionType,
            String entity,
            String targetItem,
            String oldValue,
            String newValue,
            String details
    ) {
        AuditTrailEntry entry = AuditTrailEntry.builder()
                .actor(isBlank(actor) ? "SYSTEM" : actor)
                .actionType(actionType)
                .entity(entity)
                .targetItem(targetItem)
                .oldValue(oldValue)
                .newValue(newValue)
                .details(details)
                .build();
        return auditTrailRepository.save(entry);
    }

    public List<AuditTrailEntry> getEntries(
            String actor,
            String actionType,
            String entity,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        LocalDateTime fromDateTime = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate == null ? null : toDate.plusDays(1).atStartOfDay();

        return auditTrailRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(entry -> isBlank(actor) || containsIgnoreCase(entry.getActor(), actor))
                .filter(entry -> isBlank(actionType) || equalsIgnoreCase(entry.getActionType(), actionType))
                .filter(entry -> isBlank(entity) || equalsIgnoreCase(entry.getEntity(), entity))
                .filter(entry -> fromDateTime == null || !entry.getCreatedAt().isBefore(fromDateTime))
                .filter(entry -> toDateTime == null || entry.getCreatedAt().isBefore(toDateTime))
                .toList();
    }

    public void deleteEntry(Long id) {
        AuditTrailEntry entry = auditTrailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditTrailEntry", "id", id));
        auditTrailRepository.delete(entry);
    }

    private boolean containsIgnoreCase(String value, String fragment) {
        return value != null && value.toLowerCase().contains(fragment.toLowerCase());
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
