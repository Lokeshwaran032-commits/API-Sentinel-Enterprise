
package com.apishield.API_Security_Platform.Authentication.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTService jwtService;

    public JWTAuthenticationFilter(JWTService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        // No Bearer token: continue normally
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7).trim();

        String email;
        String role;

        // Validate and extract JWT information
        try {

            if (token.isEmpty() || !jwtService.isTokenValid(token)) {
                sendUnauthorizedResponse(response);
                return;
            }

            email = jwtService.extractEmail(token);
            role = jwtService.extractRole(token);

            if (email == null || email.isBlank() ||
                    role == null ||
                    !(role.equals("USER") || role.equals("ADMIN"))) {

                sendUnauthorizedResponse(response);
                return;
            }

        } catch (Exception e) {

            SecurityContextHolder.clearContext();
            sendUnauthorizedResponse(response);
            return;
        }

        // Create authentication outside the try-catch
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_" + role)
                        )
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        // Continue request without catching downstream exceptions
        filterChain.doFilter(request, response);
    }

    private void sendUnauthorizedResponse(
            HttpServletResponse response) throws IOException {

        SecurityContextHolder.clearContext();

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"error\":\"Invalid or expired JWT token\"}"
        );
    }
}
