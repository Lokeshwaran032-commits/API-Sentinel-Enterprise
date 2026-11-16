package com.apishield.API_Security_Platform.Monitoring;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final RequestLogRepository requestLogRepository;

    public RequestLoggingFilter(RequestLogRepository requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);

        } finally {

            long responseTime =
                    System.currentTimeMillis() - startTime;

            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            // Default username for unauthenticated requests
            String username = "ANONYMOUS";

            // Exclude Spring Security's anonymous authentication token
            if (authentication != null
                    && authentication.isAuthenticated()
                    && !(authentication instanceof AnonymousAuthenticationToken)) {

                username = authentication.getName();
            }

            Requestlog requestLog = new Requestlog();

            requestLog.setUsername(username);
            requestLog.setMethod(request.getMethod());
            requestLog.setEndpoint(request.getRequestURI());
            requestLog.setStatusCode(response.getStatus());
            requestLog.setResponseTimeMs(responseTime);
            requestLog.setTimestamp(LocalDateTime.now());

            try {
                requestLogRepository.save(requestLog);

            } catch (Exception e) {
                // Logging failure should not break the API response
                System.err.println(
                        "Failed to save API request log: " + e.getMessage()
                );
            }
        }
    }
}