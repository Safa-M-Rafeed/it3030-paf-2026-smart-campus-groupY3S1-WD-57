package com.smartcampus.repository;

import com.smartcampus.model.CostExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostExpenseRepository extends JpaRepository<CostExpense, Long> {

    List<CostExpense> findAllByOrderByStartDateDesc();

    /**
     * Expenses whose active window overlaps [from, to]:
     *   startDate <= to  AND  (endDate IS NULL OR endDate >= from)
     */
    @Query("SELECT e FROM CostExpense e WHERE e.startDate <= :to " +
           "AND (e.endDate IS NULL OR e.endDate >= :from) " +
           "ORDER BY e.startDate DESC")
    List<CostExpense> findOverlapping(
            @Param("from") LocalDate from,
            @Param("to")   LocalDate to
    );
}
