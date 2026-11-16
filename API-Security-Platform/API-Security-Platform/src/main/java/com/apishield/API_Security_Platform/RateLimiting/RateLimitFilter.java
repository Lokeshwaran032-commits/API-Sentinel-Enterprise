package com.apishield.API_Security_Platform.RateLimiting;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().equals("/api/rate-limit/status");
    }
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)

            throws ServletException, IOException {


        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // User is not authenticated
        if (authentication == null ||
                !authentication.isAuthenticated()) {

            filterChain.doFilter(request, response);
            return;
        }

        // Get logged-in user's email
        String username =
                authentication.getName();

        // Get user's role
        String role = authentication
                .getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        // Remove ROLE_ prefix
        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        System.out.println(
                "RATE LIMIT USER: " + username
        );

        System.out.println(
                "RATE LIMIT ROLE: " + role
        );

        // Check rate limit
        RateLimitService.RateLimitResult result =
                rateLimitService.checkRateLimit(
                        username,
                        role
                );

        // Add rate limit headers
        response.setHeader(
                "X-RateLimit-Limit",
                String.valueOf(
                        result.getLimit()
                )
        );

        response.setHeader(
                "X-RateLimit-Remaining",
                String.valueOf(
                        result.getRemaining()
                )
        );

        // Limit exceeded
        if (!result.isAllowed()) {

            response.setStatus(429);

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"error\":\"Too many requests. Please try again later.\"}"
            );

            return;
        }

        // Request allowed
        filterChain.doFilter(request, response);

    }
}