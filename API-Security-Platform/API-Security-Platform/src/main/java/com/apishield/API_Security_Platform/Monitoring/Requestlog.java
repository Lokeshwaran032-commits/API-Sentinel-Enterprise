package com.apishield.API_Security_Platform.Monitoring;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_request_logs")
@Getter
@Setter
public class Requestlog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String method;

    private String endpoint;

    private int statusCode;

    private long responseTimeMs;

    private LocalDateTime timestamp;
}
