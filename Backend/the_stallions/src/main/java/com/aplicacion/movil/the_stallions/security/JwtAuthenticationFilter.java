package com.aplicacion.movil.the_stallions.security;

import com.aplicacion.movil.the_stallions.model.UserSession;
import com.aplicacion.movil.the_stallions.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserSessionRepository userSessionRepository;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserSessionRepository userSessionRepository) {
        this.jwtUtils = jwtUtils;
        this.userSessionRepository = userSessionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtils.isTokenValid(token)) {
                String email = jwtUtils.getEmailFromToken(token);
                String tokenId = jwtUtils.getTokenIdFromToken(token);
                UserSession session = tokenId != null
                        ? userSessionRepository.findByTokenId(tokenId).orElse(null)
                        : null;

                if (session != null && session.isActive()) {
                    var auth = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                    auth.setDetails(session.getId());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
