package com.apishield.API_Security_Platform.RateLimiting;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rate-limit")
public class RateLimitStatusController {

    private final RateLimitService rateLimitService;

    public RateLimitStatusController(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public RateLimitService.RateLimitResult getStatus(
            Authentication authentication) {

        String username = authentication.getName();

        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority ->
                        authority.equals("ROLE_ADMIN")
                                || authority.equals("ROLE_USER"))
                .findFirst()
                .orElse("ROLE_USER");

        role = role.replace("ROLE_", "");

        return rateLimitService.getCurrentStatus(username, role);
    }
}