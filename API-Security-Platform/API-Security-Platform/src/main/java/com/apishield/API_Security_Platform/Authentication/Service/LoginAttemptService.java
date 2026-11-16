
package com.apishield.API_Security_Platform.Authentication.Service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long TIME_WINDOW = 60 * 1000;

    private final Map<String, AttemptWindow> attempts =
            new ConcurrentHashMap<>();

    public void checkAllowed(String ipAddress) {

        AttemptWindow window = attempts.get(ipAddress);

        if (window == null) {
            return;
        }

        synchronized (window) {

            long currentTime = System.currentTimeMillis();

            if (currentTime - window.windowStart >= TIME_WINDOW) {
                attempts.remove(ipAddress, window);
                return;
            }

            if (window.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many failed login attempts. Please try again after one minute."
                );
            }
        }
    }

    public void recordFailure(String ipAddress) {

        AttemptWindow window = attempts.computeIfAbsent(
                ipAddress,
                key -> new AttemptWindow()
        );

        synchronized (window) {

            long currentTime = System.currentTimeMillis();

            if (currentTime - window.windowStart >= TIME_WINDOW) {
                window.windowStart = currentTime;
                window.failedAttempts = 0;
            }

            window.failedAttempts++;
        }
    }

    public void recordSuccess(String ipAddress) {

        attempts.remove(ipAddress);
    }

    private static class AttemptWindow {

        private long windowStart = System.currentTimeMillis();
        private int failedAttempts = 0;
    }
}
