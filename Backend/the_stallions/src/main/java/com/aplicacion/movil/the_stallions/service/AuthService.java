package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.*;
import com.aplicacion.movil.the_stallions.dto.Response.AuthResponse;
import com.aplicacion.movil.the_stallions.model.AuthProvider;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.UserSession;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.UserSessionRepository;
import com.aplicacion.movil.the_stallions.config.FirebaseTokenService;
import com.aplicacion.movil.the_stallions.security.JwtUtils;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final FirebaseTokenService firebaseTokenService;
    private final UserSessionRepository userSessionRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtUtils jwtUtils, FirebaseTokenService firebaseTokenService,
                        UserSessionRepository userSessionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.firebaseTokenService = firebaseTokenService;
        this.userSessionRepository = userSessionRepository;
    }

    public AuthResponse register(RegisterRequest request, String userAgent, String clientIp) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("El correo ya está registrado");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setProvider(AuthProvider.LOCAL);

        userRepository.save(user);
        return buildAuthResponse(user, userAgent, clientIp);
    }

    public AuthResponse login(LoginRequest request, String userAgent, String clientIp) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (user.getProvider() != AuthProvider.LOCAL || user.getPasswordHash() == null) {
            throw new IllegalStateException("Esta cuenta usa inicio de sesión con Google");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        return buildAuthResponse(user, userAgent, clientIp);
    }

    public AuthResponse loginOrRegisterWithGoogle(GoogleAuthRequest request, String userAgent, String clientIp) {
        FirebaseToken decoded = firebaseTokenService.verifyToken(request.getIdToken());
        String email = decoded.getEmail();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(decoded.getName() != null ? decoded.getName() : email);
            newUser.setProvider(AuthProvider.GOOGLE);
            newUser.setProviderId(decoded.getUid());
            return userRepository.save(newUser);
        });

        if (user.getProviderId() == null) {
            user.setProviderId(decoded.getUid());
        }
        if (user.getPhotoUrl() == null && decoded.getPicture() != null) {
            user.setPhotoUrl(decoded.getPicture());
        }
        if (user.getUsername() == null) {
            user.setUsername(email.split("@")[0]);
        }
        userRepository.save(user);

        return buildAuthResponse(user, userAgent, clientIp);
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            String tokenId = jwtUtils.getTokenIdFromToken(token);
            if (tokenId != null) {
                userSessionRepository.findByTokenId(tokenId).ifPresent(session -> {
                    session.setActive(false);
                    userSessionRepository.save(session);
                });
            }
        } catch (Exception ignored) {
            // token inválido o expirado: no hay sesión que revocar
        }
    }

    private AuthResponse buildAuthResponse(User user, String userAgent, String clientIp) {
        String tokenId = UUID.randomUUID().toString();
        UserSession session = new UserSession();
        session.setUser(user);
        session.setDevice(deriveDevice(userAgent));
        session.setPlatform(derivePlatform(userAgent));
        session.setLocation(clientIp != null && !clientIp.isBlank() ? clientIp : "Ubicación desconocida");
        session.setActive(true);
        session.setLastActive(LocalDateTime.now());
        session.setTokenId(tokenId);
        userSessionRepository.save(session);

        String token = jwtUtils.generateToken(user.getEmail(), tokenId);
        return new AuthResponse(token, user.getEmail(), user.getFullName());
    }

    private String derivePlatform(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "web";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("android")) {
            return "android";
        }
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod")) {
            return "ios";
        }
        return "web";
    }

    private String deriveDevice(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Dispositivo móvil";
        }
        return userAgent.length() > 60 ? userAgent.substring(0, 60) : userAgent;
    }
}
