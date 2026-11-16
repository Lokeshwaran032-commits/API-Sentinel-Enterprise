package com.apishield.API_Security_Platform.Monitoring;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestLogRepository
        extends JpaRepository<Requestlog, Long> {

    List<Requestlog> findByUsername(String username);
}