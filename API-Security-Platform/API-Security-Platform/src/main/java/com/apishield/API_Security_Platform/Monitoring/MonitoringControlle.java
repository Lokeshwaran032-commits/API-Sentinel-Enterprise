package com.apishield.API_Security_Platform.Monitoring;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
class MonitoringController {

    private final RequestLogRepository requestLogRepository;

    public MonitoringController(
            RequestLogRepository requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }

    // View all API request logs
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Requestlog> getAllLogs() {

        return requestLogRepository.findAll();
    }

    // Count total API requests
    @GetMapping("/logs/count")
    @PreAuthorize("hasRole('ADMIN')")
    public long getLogCount() {

        return requestLogRepository.count();
    }

    // View logs for a particular user
    @GetMapping("/logs/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Requestlog> getUserLogs(
            @PathVariable String username) {

        return requestLogRepository
                .findByUsername(username);
    }
}