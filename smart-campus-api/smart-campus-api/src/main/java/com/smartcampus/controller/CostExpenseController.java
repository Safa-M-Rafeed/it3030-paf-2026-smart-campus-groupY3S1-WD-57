package com.smartcampus.controller;

import com.smartcampus.dto.CostExpenseDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.CostSummaryResponse;
import com.smartcampus.service.CostExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cost-expenses")
public class CostExpenseController {

    private final CostExpenseService service;

    public CostExpenseController(CostExpenseService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CostExpenseDTO>> create(
            @Valid @RequestBody CostExpenseDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(dto), "Expense created"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CostExpenseDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(), "Expenses fetched"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CostExpenseDTO>> getById(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id), "Expense fetched"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CostExpenseDTO>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody CostExpenseDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, dto), "Expense updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Expense deleted"));
    }

    /**
     * GET /api/cost-expenses/summary?from=2026-01-01&to=2026-04-30
     * Returns total, monthly projection, annual projection, by-category, by-month, and expense rows.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CostSummaryResponse>> getSummary(
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to",   required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(service.getSummary(from, to), "Cost summary fetched"));
    }
}
