
package com.apishield.API_Security_Platform.Authentication.Service;

import com.apishield.API_Security_Platform.Authentication.Security.JWTService;
import com.apishield.API_Security_Platform.Authentication.dto.LoginRequest;
import com.apishield.API_Security_Platform.Authentication.dto.RegisterRequest;
import com.apishield.API_Security_Platform.User.Entity.user;
import com.apishield.API_Security_Platform.User.Repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.apishield.API_Security_Platform.Authentication.Exception.EmailAlreadyRegisteredException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final LoginAttemptService loginAttemptService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JWTService jwtService,
            LoginAttemptService loginAttemptService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
    }

    public void register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyRegisteredException(
                    "Email already registered"
            );
        }

        user user1 = new user();

        user1.setName(request.getName());
        user1.setEmail(request.getEmail());

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user1.setPassword(hashedPassword);
        user1.setRole("USER");

        userRepository.save(user1);
    }

    public String login(LoginRequest request, String ipAddress) {

        // Check whether this IP is temporarily blocked
        loginAttemptService.checkAllowed(ipAddress);

        user user1 = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        // Invalid email
        if (user1 == null) {

            loginAttemptService.recordFailure(ipAddress);

            throw new RuntimeException("Invalid email or password");
        }

        // Invalid password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user1.getPassword())) {

            loginAttemptService.recordFailure(ipAddress);

            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT after successful authentication
        String token = jwtService.generateToken(
                user1.getEmail(),
                user1.getRole()
        );

        // Reset failed login attempts
        loginAttemptService.recordSuccess(ipAddress);

        return token;
    }
}
