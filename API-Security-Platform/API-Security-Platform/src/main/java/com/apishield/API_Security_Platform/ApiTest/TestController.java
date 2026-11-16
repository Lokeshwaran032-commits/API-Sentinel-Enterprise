package com.apishield.API_Security_Platform.ApiTest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/user/profile")
    @PreAuthorize("hasRole('USER')")
    public String userProfile() {
        return "Welcome USER! You have access to the user profile.";
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard() {
        return "Welcome ADMIN! You have access to the admin dashboard.";
    }
}