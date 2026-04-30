package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MostActiveUsersReportResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private String rangeType;
    private List<Row> users;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Row {
        private String name;
        private String email;
        private long bookingsMade;
        private long ticketsCreated;
        private long commentsPosted;
        private long totalActions;
        private LocalDateTime lastActiveTime;
    }
}
