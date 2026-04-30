package com.smartcampus.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostSummaryResponse {

    /** Total cost for the requested range (LKR) */
    private BigDecimal totalLkr;

    /** Total projected monthly cost (LKR) */
    private BigDecimal monthlyTotalLkr;

    /** Total projected annual cost (LKR) */
    private BigDecimal annualTotalLkr;

    /** Breakdown by category — range-computed amounts */
    private Map<String, BigDecimal> byCategory;

    /** Breakdown by category — normalised to monthly amounts (DAILY×30, MONTHLY×unit) */
    private Map<String, BigDecimal> byCategoryMonthly;

    /** Monthly breakdown: key = "YYYY-MM", value = total LKR */
    private Map<String, BigDecimal> byMonth;

    /** The filtered expense list */
    private List<ExpenseRow> expenses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpenseRow {
        private Long id;
        private String name;
        private String category;
        private BigDecimal amountLkr;
        private String recurrenceType;
        private String startDate;
        private String endDate;
        private String note;
        /** Computed cost within the requested range */
        private BigDecimal computedLkr;
    }
}
