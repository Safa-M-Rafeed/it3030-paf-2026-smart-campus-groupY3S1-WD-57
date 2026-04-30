package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDashboardResponse {
    private Summary summary;
    private List<BarPoint> peakBookingHours;
    private List<LinePoint> incidentResolutionTrend;
    private List<PiePoint> resourceTypeBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private long totalBookingsThisWeek;
        private long openTickets;
        private long resolvedTickets;
        private double resourceAvailabilityPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BarPoint {
        private String hour;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LinePoint {
        private String date;
        private long resolvedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PiePoint {
        private String type;
        private long count;
    }
}
