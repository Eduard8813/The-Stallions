package com.aplicacion.movil.the_stallions.security;

import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.UserSession;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro de autenticación JWT.
 *
 * <p>Además de validar la firma y la sesión activa, carga el usuario desde la
 * base de datos en cada petición para que el {@code rol} asignado tenga efecto
 * inmediato (sin esperar a que expire el token). Si la sesión superó el tiempo
 * máximo de inactividad o el usuario está suspendido, la petición se rechaza.</p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;

    @Value("${app.session.max-inactivity-minutes:720}")
    private long maxInactivityMinutes;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserSessionRepository userSessionRepository,
                                   UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userSessionRepository = userSessionRepository;
        this.userRepository = userRepository;
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

                if (session != null && session.isActive() && !session.isExpired(maxInactivityMinutes)) {
                    User user = userRepository.findByEmail(email).orElse(null);

                    if (user != null && user.isEnabled()) {
                        var auth = new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRol().name())));
                        auth.setDetails(session.getId());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                } else if (session != null && (session.isExpired(maxInactivityMinutes) || !session.isActive())) {
                    session.setActive(false);
                    userSessionRepository.save(session);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}