package com.smartcampus.controller;

import com.smartcampus.dto.response.AnalyticsDashboardResponse;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.SystemHealthStatusBoardResponse;
import com.smartcampus.service.AnalyticsService;
import com.smartcampus.service.SystemHealthStatusBoardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SystemHealthStatusBoardService systemHealthStatusBoardService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            SystemHealthStatusBoardService systemHealthStatusBoardService
    ) {
        this.analyticsService = analyticsService;
        this.systemHealthStatusBoardService = systemHealthStatusBoardService;
    }

    @GetMapping("/analytics-dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getAnalyticsDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getDashboard(fromDate, toDate),
                "Analytics dashboard fetched successfully"
        ));
    }

    @GetMapping("/system-health-status-board")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemHealthStatusBoardResponse>> getSystemHealthStatusBoard() {
        return ResponseEntity.ok(ApiResponse.success(
                systemHealthStatusBoardService.getBoardData(),
                "System health status board fetched successfully"
        ));
    }
}
