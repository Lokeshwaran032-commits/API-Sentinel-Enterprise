
package com.apishield.API_Security_Platform.Authentication.Controller;

import com.apishield.API_Security_Platform.Authentication.dto.RegisterRequest;
import com.apishield.API_Security_Platform.Authentication.Service.AuthService;
import com.apishield.API_Security_Platform.Authentication.dto.LoginRequest;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public String register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return "User registered successfully";
    }

    @PostMapping("/login")
    public String login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();

        return authService.login(request, ipAddress);
    }
}
