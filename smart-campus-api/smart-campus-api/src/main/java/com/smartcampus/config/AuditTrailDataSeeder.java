package com.smartcampus.config;

import com.smartcampus.model.AuditTrailEntry;
import com.smartcampus.repository.AuditTrailRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(2)
public class AuditTrailDataSeeder implements CommandLineRunner {

    private final AuditTrailRepository auditTrailRepository;

    public AuditTrailDataSeeder(AuditTrailRepository auditTrailRepository) {
        this.auditTrailRepository = auditTrailRepository;
    }

    @Override
    public void run(String... args) {
        seedIfEmpty();
    }

    private void seedIfEmpty() {
        // Only seed if very few entries exist (fresh DB)
        if (auditTrailRepository.count() > 20) return;

        LocalDateTime now = LocalDateTime.now();
        List<AuditTrailEntry> entries = new ArrayList<>();

        // ── 30 days of incident resolution trend data ─────────────────────────
        // Spread resolved tickets across the last 30 days at realistic hours
        int[][] resolutionData = {
            // {daysAgo, hour, ticketNum}
            {29, 10, 2200}, {29, 14, 2201}, {29, 16, 2202},
            {28,  9, 2203}, {28, 11, 2204},
            {27, 13, 2205}, {27, 15, 2206}, {27, 17, 2207},
            {26, 10, 2208},
            {25,  9, 2209}, {25, 14, 2210}, {25, 16, 2211},
            {24, 11, 2212}, {24, 15, 2213},
            {23, 10, 2214}, {23, 13, 2215}, {23, 16, 2216}, {23, 17, 2217},
            {22,  9, 2218}, {22, 14, 2219},
            {21, 10, 2220}, {21, 11, 2221},
            {20, 13, 2222}, {20, 15, 2223}, {20, 16, 2224},
            {19,  9, 2225}, {19, 14, 2226},
            {18, 10, 2227}, {18, 15, 2228}, {18, 17, 2229},
            {17, 11, 2230}, {17, 13, 2231},
            {16,  9, 2232}, {16, 14, 2233}, {16, 16, 2234},
            {15, 10, 2235}, {15, 15, 2236},
            {14, 11, 2237}, {14, 13, 2238}, {14, 17, 2239},
            {13,  9, 2240}, {13, 14, 2241},
            {12, 10, 2242}, {12, 15, 2243}, {12, 16, 2244},
            {11, 11, 2245}, {11, 13, 2246},
            {10,  9, 2247}, {10, 14, 2248}, {10, 17, 2249},
            { 9, 10, 2250}, { 9, 15, 2251},
            { 8, 11, 2252}, { 8, 13, 2253}, { 8, 16, 2254},
            { 7,  9, 2255}, { 7, 14, 2256},
            { 6, 10, 2257}, { 6, 15, 2258}, { 6, 17, 2259},
            { 5, 11, 2260}, { 5, 13, 2261},
            { 4,  9, 2262}, { 4, 14, 2263}, { 4, 16, 2264},
            { 3, 10, 2265}, { 3, 15, 2266},
            { 2, 11, 2267}, { 2, 13, 2268}, { 2, 17, 2269},
            { 1,  9, 2270}, { 1, 14, 2271}, { 1, 16, 2272},
            { 0, 10, 2273}, { 0, 15, 2274},
        };

        String[] techs = {"tech.jay@campus.lk", "tech.ravi@campus.lk", "tech.nila@campus.lk"};
        String[] prevStates = {"OPEN", "IN_PROGRESS"};
        String[] resolvedStates = {"RESOLVED", "CLOSED"};

        for (int i = 0; i < resolutionData.length; i++) {
            int daysAgo = resolutionData[i][0];
            int hour    = resolutionData[i][1];
            int tickNum = resolutionData[i][2];
            String tech = techs[i % techs.length];
            String prev = prevStates[i % 2];
            String resolved = resolvedStates[i % 2];

            entries.add(AuditTrailEntry.builder()
                    .actor(tech)
                    .actionType("TICKET_STATUS_CHANGED")
                    .entity("TICKET")
                    .targetItem("Ticket #TK-" + tickNum)
                    .oldValue(prev)
                    .newValue(resolved)
                    .details("Ticket resolved by technician")
                    .createdAt(now.minusDays(daysAgo).withHour(hour).withMinute(0).withSecond(0))
                    .build());
        }

        // ── Peak booking hours — spread across realistic campus hours ─────────
        // Heavy usage: 08-10, 13-15; moderate: 10-12, 15-17; light: rest
        int[][] bookingData = {
            // {daysAgo, hour, bookingNum}
            {0, 8, 1100}, {0, 8, 1101}, {0, 9, 1102}, {0, 9, 1103},
            {0,10, 1104}, {0,13, 1105}, {0,13, 1106}, {0,14, 1107},
            {0,14, 1108}, {0,15, 1109}, {0,16, 1110},
            {1, 8, 1111}, {1, 9, 1112}, {1, 9, 1113}, {1,10, 1114},
            {1,11, 1115}, {1,13, 1116}, {1,14, 1117}, {1,14, 1118},
            {1,15, 1119}, {1,16, 1120}, {1,17, 1121},
            {2, 8, 1122}, {2, 8, 1123}, {2, 9, 1124}, {2,10, 1125},
            {2,13, 1126}, {2,13, 1127}, {2,14, 1128}, {2,15, 1129},
            {3, 8, 1130}, {3, 9, 1131}, {3,10, 1132}, {3,11, 1133},
            {3,13, 1134}, {3,14, 1135}, {3,15, 1136}, {3,16, 1137},
            {4, 8, 1138}, {4, 9, 1139}, {4,13, 1140}, {4,14, 1141},
            {5, 8, 1142}, {5, 9, 1143}, {5,10, 1144}, {5,14, 1145},
            {6, 8, 1146}, {6, 9, 1147}, {6,13, 1148}, {6,14, 1149},
            {7, 8, 1150}, {7, 9, 1151}, {7,10, 1152}, {7,13, 1153},
            {7,14, 1154}, {7,15, 1155},
        };

        for (int[] bd : bookingData) {
            int daysAgo = bd[0];
            int hour    = bd[1];
            int bkNum   = bd[2];
            entries.add(AuditTrailEntry.builder()
                    .actor("sliit.admin@campus.lk")
                    .actionType("BOOKING_APPROVED")
                    .entity("BOOKING")
                    .targetItem("Booking #BK-" + bkNum)
                    .oldValue("PENDING")
                    .newValue("APPROVED")
                    .details("Booking approved")
                    .createdAt(now.minusDays(daysAgo).withHour(hour).withMinute(15).withSecond(0))
                    .build());
        }

        // ── A few extra audit entries for variety ─────────────────────────────
        entries.addAll(List.of(
            AuditTrailEntry.builder()
                    .actor("sliit.admin@campus.lk")
                    .actionType("RESOURCE_UPDATED")
                    .entity("RESOURCE")
                    .targetItem("Room LAB-02")
                    .oldValue("capacity=30")
                    .newValue("capacity=36")
                    .details("Updated after lab renovation")
                    .createdAt(now.minusHours(2))
                    .build(),
            AuditTrailEntry.builder()
                    .actor("manager.ops@campus.lk")
                    .actionType("USER_LOGIN")
                    .entity("USER")
                    .targetItem("manager.ops@campus.lk")
                    .oldValue(null)
                    .newValue("SUCCESS")
                    .details("Authenticated via Google OAuth")
                    .createdAt(now.minusMinutes(45))
                    .build()
        ));

        entries.forEach(this::saveIfMissing);
    }

    private void saveIfMissing(AuditTrailEntry entry) {
        if (auditTrailRepository.existsByActionTypeAndTargetItem(
                entry.getActionType(), entry.getTargetItem())) {
            return;
        }
        auditTrailRepository.save(entry);
    }
}
