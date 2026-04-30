package com.smartcampus.service;

import com.smartcampus.dto.CostExpenseDTO;
import com.smartcampus.dto.response.CostSummaryResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.CostExpense;
import com.smartcampus.model.enums.RecurrenceType;
import com.smartcampus.repository.CostExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class CostExpenseService {

    private final CostExpenseRepository repo;

    public CostExpenseService(CostExpenseRepository repo) {
        this.repo = repo;
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public CostExpenseDTO create(CostExpenseDTO dto) {
        CostExpense entity = toEntity(dto);
        entity.setId(null);
        return toDTO(repo.save(entity));
    }

    public List<CostExpenseDTO> getAll() {
        return repo.findAllByOrderByStartDateDesc().stream().map(this::toDTO).toList();
    }

    public CostExpenseDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    public CostExpenseDTO update(Long id, CostExpenseDTO dto) {
        CostExpense existing = findOrThrow(id);
        existing.setName(dto.getName());
        existing.setCategory(dto.getCategory());
        existing.setAmountLkr(dto.getAmountLkr());
        existing.setRecurrenceType(dto.getRecurrenceType());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setNote(dto.getNote());
        return toDTO(repo.save(existing));
    }

    public void delete(Long id) {
        repo.delete(findOrThrow(id));
    }

    // ── Summary / reporting ───────────────────────────────────────────────────

    /**
     * Calculate cost summary for the given date range.
     * For each expense that overlaps [from, to]:
     *   DAILY   → amountLkr × (number of days in overlap)
     *   MONTHLY → amountLkr × (number of months in overlap)
     */
    public CostSummaryResponse getSummary(LocalDate from, LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfYear(1);
        if (to   == null) to   = LocalDate.now();

        List<CostExpense> expenses = repo.findOverlapping(from, to);

        BigDecimal total = BigDecimal.ZERO;
        Map<String, BigDecimal> byCategory         = new LinkedHashMap<>();
        Map<String, BigDecimal> byCategoryMonthly  = new LinkedHashMap<>();
        Map<String, BigDecimal> byMonth            = new LinkedHashMap<>();
        List<CostSummaryResponse.ExpenseRow> rows  = new ArrayList<>();

        for (CostExpense e : expenses) {
            LocalDate effStart = e.getStartDate().isBefore(from) ? from : e.getStartDate();
            LocalDate effEnd   = (e.getEndDate() == null || e.getEndDate().isAfter(to)) ? to : e.getEndDate();

            BigDecimal computed = computeCost(e, effStart, effEnd);
            total = total.add(computed);

            // range-based by category
            byCategory.merge(e.getCategory().name(), computed, BigDecimal::add);

            // monthly-normalised by category: DAILY×30, MONTHLY×unit
            BigDecimal monthly = e.getRecurrenceType() == RecurrenceType.DAILY
                    ? e.getAmountLkr().multiply(BigDecimal.valueOf(30))
                    : e.getAmountLkr();
            byCategoryMonthly.merge(e.getCategory().name(), monthly, BigDecimal::add);

            // by month
            distributeByMonth(e, effStart, effEnd, byMonth);

            rows.add(CostSummaryResponse.ExpenseRow.builder()
                    .id(e.getId())
                    .name(e.getName())
                    .category(e.getCategory().name())
                    .amountLkr(e.getAmountLkr())
                    .recurrenceType(e.getRecurrenceType().name())
                    .startDate(e.getStartDate().toString())
                    .endDate(e.getEndDate() != null ? e.getEndDate().toString() : null)
                    .note(e.getNote())
                    .computedLkr(computed)
                    .build());
        }

        // Sort byMonth by key
        Map<String, BigDecimal> sortedByMonth = new TreeMap<>(byMonth);

        // Monthly & annual projections from all active expenses
        BigDecimal monthlyTotal = computeMonthlyProjection();
        BigDecimal annualTotal  = monthlyTotal.multiply(BigDecimal.valueOf(12));

        return CostSummaryResponse.builder()
                .totalLkr(total.setScale(2, RoundingMode.HALF_UP))
                .monthlyTotalLkr(monthlyTotal.setScale(2, RoundingMode.HALF_UP))
                .annualTotalLkr(annualTotal.setScale(2, RoundingMode.HALF_UP))
                .byCategory(byCategory)
                .byCategoryMonthly(byCategoryMonthly)
                .byMonth(sortedByMonth)
                .expenses(rows)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BigDecimal computeCost(CostExpense e, LocalDate from, LocalDate to) {
        if (e.getRecurrenceType() == RecurrenceType.DAILY) {
            long days = ChronoUnit.DAYS.between(from, to) + 1;
            return e.getAmountLkr().multiply(BigDecimal.valueOf(days));
        } else {
            // MONTHLY: count distinct months in [from, to]
            long months = countMonths(from, to);
            return e.getAmountLkr().multiply(BigDecimal.valueOf(months));
        }
    }

    private void distributeByMonth(CostExpense e, LocalDate from, LocalDate to,
                                   Map<String, BigDecimal> byMonth) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        YearMonth start = YearMonth.from(from);
        YearMonth end   = YearMonth.from(to);

        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            LocalDate mStart = ym.atDay(1).isBefore(from) ? from : ym.atDay(1);
            LocalDate mEnd   = ym.atEndOfMonth().isAfter(to) ? to : ym.atEndOfMonth();
            BigDecimal cost  = computeCost(e, mStart, mEnd);
            byMonth.merge(ym.format(fmt), cost, BigDecimal::add);
        }
    }

    /** Monthly projection = sum of all MONTHLY expenses + (DAILY × 30) */
    private BigDecimal computeMonthlyProjection() {
        return repo.findAll().stream()
                .filter(e -> e.getEndDate() == null || !e.getEndDate().isBefore(LocalDate.now()))
                .map(e -> e.getRecurrenceType() == RecurrenceType.MONTHLY
                        ? e.getAmountLkr()
                        : e.getAmountLkr().multiply(BigDecimal.valueOf(30)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countMonths(LocalDate from, LocalDate to) {
        YearMonth ymFrom = YearMonth.from(from);
        YearMonth ymTo   = YearMonth.from(to);
        return ChronoUnit.MONTHS.between(ymFrom, ymTo) + 1;
    }

    private CostExpense toEntity(CostExpenseDTO dto) {
        return CostExpense.builder()
                .id(dto.getId())
                .name(dto.getName())
                .category(dto.getCategory())
                .amountLkr(dto.getAmountLkr())
                .recurrenceType(dto.getRecurrenceType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .note(dto.getNote())
                .build();
    }

    private CostExpenseDTO toDTO(CostExpense e) {
        return CostExpenseDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .category(e.getCategory())
                .amountLkr(e.getAmountLkr())
                .recurrenceType(e.getRecurrenceType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .note(e.getNote())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private CostExpense findOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CostExpense", "id", id));
    }
}
