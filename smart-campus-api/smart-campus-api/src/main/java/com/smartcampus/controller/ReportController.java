package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.MostActiveUsersReportResponse;
import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.service.AuditTrailService;
import com.smartcampus.service.MostActiveUsersReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final MostActiveUsersReportService mostActiveUsersReportService;

    public ReportController(
            AuditTrailService auditTrailService,
            MostActiveUsersReportService mostActiveUsersReportService
    ) {
        this.auditTrailService = auditTrailService;
        this.mostActiveUsersReportService = mostActiveUsersReportService;
    }

    @GetMapping("/audit-trail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditTrailEntry>>> getAuditTrail(
            @RequestParam(name = "actor",      required = false) String actor,
            @RequestParam(name = "actionType", required = false) String actionType,
            @RequestParam(name = "entity",     required = false) String entity,
            @RequestParam(name = "fromDate",   required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate",     required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                auditTrailService.getEntries(actor, actionType, entity, fromDate, toDate),
                "Audit trail fetched successfully"
        ));
    }

    @DeleteMapping("/audit-trail/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditEntry(@PathVariable("id") Long id) {
        auditTrailService.deleteEntry(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Audit entry deleted successfully"));
    }

    @GetMapping("/report-export/most-active-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MostActiveUsersReportResponse>> getMostActiveUsersReport(
            @RequestParam(name = "rangeType", defaultValue = "this_week") String rangeType,
            @RequestParam(name = "fromDate",  required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate",    required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        MostActiveUsersReportResponse report = mostActiveUsersReportService.getReport(rangeType, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(report, "Most active users report fetched successfully"));
    }

    @GetMapping("/report-export/most-active-users/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportMostActiveUsersCsv(
            @RequestParam(name = "rangeType", defaultValue = "this_week") String rangeType,
            @RequestParam(name = "fromDate",  required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate",    required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        MostActiveUsersReportResponse report = mostActiveUsersReportService.getReport(rangeType, fromDate, toDate);
        String csv = mostActiveUsersReportService.toCsv(report);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=most-active-users-report.csv")
                .contentType(MediaType.valueOf("text/csv"))
                .body(csv);
    }
}
