package com.smartcampus.model;

import com.smartcampus.model.enums.ExpenseCategory;
import com.smartcampus.model.enums.RecurrenceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cost_expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    /** Amount in LKR */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountLkr;

    /**
     * DAILY  – expense repeats every day (e.g. daily utility cost)
     * MONTHLY – expense repeats every month (e.g. monthly licence fee)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurrenceType recurrenceType;

    /** The start date of this expense */
    @Column(nullable = false)
    private LocalDate startDate;

    /** Optional end date; null means ongoing */
    @Column
    private LocalDate endDate;

    @Column(length = 1000)
    private String note;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
