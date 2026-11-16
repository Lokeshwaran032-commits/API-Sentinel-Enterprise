
package com.apishield.API_Security_Platform.RateLimiting;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class RateLimitService {

    private final Map<String, UserRequestInfo> requestMap =
            new ConcurrentHashMap<>();

    private static final int USER_MAX_REQUESTS = 10;
    private static final int ADMIN_MAX_REQUESTS = 20;

    private static final long TIME_WINDOW =
            60 * 1000; // 1 minute

    public RateLimitResult checkRateLimit(
            String username,
            String role) {

        long currentTime = System.currentTimeMillis();

        int maxRequests = getMaxRequests(role);

        String key = username + ":" + role;

        AtomicReference<RateLimitResult> resultReference =
                new AtomicReference<>();

        requestMap.compute(key, (userKey, existingInfo) -> {

            // First request
            if (existingInfo == null) {

                existingInfo = new UserRequestInfo(
                        1,
                        currentTime
                );

            }

            // Time window expired
            else if (currentTime - existingInfo.startTime
                    >= TIME_WINDOW) {

                existingInfo.requestCount = 1;
                existingInfo.startTime = currentTime;

            }

            // Increase request count
            else {

                existingInfo.requestCount++;
            }

            // Check whether request is allowed
            boolean allowed =
                    existingInfo.requestCount <= maxRequests;

            int remaining = Math.max(
                    0,
                    maxRequests - existingInfo.requestCount
            );

            // Capture result inside atomic computation
            resultReference.set(
                    new RateLimitResult(
                            allowed,
                            remaining,
                            maxRequests
                    )
            );

            return existingInfo;
        });

        return resultReference.get();
    }

    public int getMaxRequests(String role) {

        if ("ADMIN".equalsIgnoreCase(role)) {
            return ADMIN_MAX_REQUESTS;
        }

        return USER_MAX_REQUESTS;
    }
    
    public RateLimitResult getCurrentStatus(String username, String role) {

        int maxRequests = getMaxRequests(role);

        String key = username + ":" + role;

        UserRequestInfo info = requestMap.get(key);

        if (info == null) {
            return new RateLimitResult(true, maxRequests, maxRequests);
        }

        long currentTime = System.currentTimeMillis();

        // If the one-minute window has expired, reset the displayed count.
        if (currentTime - info.startTime >= TIME_WINDOW) {
            return new RateLimitResult(true, maxRequests, maxRequests);
        }

        int remaining = Math.max(
                0,
                maxRequests - info.requestCount
        );

        boolean allowed = info.requestCount < maxRequests;

        return new RateLimitResult(
                allowed,
                remaining,
                maxRequests
        );
    }
    // Remove expired rate-limit entries every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredEntries() {

        long currentTime = System.currentTimeMillis();

        requestMap.entrySet().removeIf(entry ->
                currentTime - entry.getValue().startTime
                        >= TIME_WINDOW
        );
    }

    private static class UserRequestInfo {

        private int requestCount;

        private long startTime;

        public UserRequestInfo(
                int requestCount,
                long startTime) {

            this.requestCount = requestCount;
            this.startTime = startTime;
        }
    }

    public static class RateLimitResult {

        private final boolean allowed;

        private final int remaining;

        private final int limit;

        public RateLimitResult(
                boolean allowed,
                int remaining,
                int limit) {

            this.allowed = allowed;
            this.remaining = remaining;
            this.limit = limit;
        }

        public boolean isAllowed() {
            return allowed;
        }

        public int getRemaining() {
            return remaining;
        }

        public int getLimit() {
            return limit;
        }
    }
}
