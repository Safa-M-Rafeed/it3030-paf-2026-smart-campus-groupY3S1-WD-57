package com.smartcampus.repository;

import com.smartcampus.model.AuditTrailEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditTrailRepository extends JpaRepository<AuditTrailEntry, Long> {
    List<AuditTrailEntry> findAllByOrderByCreatedAtDesc();
}
