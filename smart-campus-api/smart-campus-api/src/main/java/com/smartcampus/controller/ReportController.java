package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.service.AuditTrailService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final AuditTrailService auditTrailService;

    public ReportController(AuditTrailService auditTrailService) {
        this.auditTrailService = auditTrailService;
    }

    @GetMapping("/audit-trail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditTrailEntry>>> getAuditTrail(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                auditTrailService.getEntries(actor, actionType, entity, fromDate, toDate),
                "Audit trail fetched successfully"
        ));
    }

    @DeleteMapping("/audit-trail/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditEntry(@PathVariable Long id) {
        auditTrailService.deleteEntry(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Audit entry deleted successfully"));
    }
}
