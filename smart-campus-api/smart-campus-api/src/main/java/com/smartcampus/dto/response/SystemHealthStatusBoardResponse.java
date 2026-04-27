package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemHealthStatusBoardResponse {
    private long totalUsersRegistered;
    private long totalResources;
    private long pendingBookingsWaitingApproval;
    private long unresolvedTicketsOlderThan3Days;
    private Map<String, Long> databaseRecordCountsPerTable;
    private LocalDateTime generatedAt;
}
