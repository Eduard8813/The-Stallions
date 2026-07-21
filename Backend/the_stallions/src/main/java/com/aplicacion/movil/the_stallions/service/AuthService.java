package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.*;
import com.aplicacion.movil.the_stallions.dto.Response.AuthResponse;
import com.aplicacion.movil.the_stallions.model.AuthProvider;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.config.FirebaseTokenService;
import com.aplicacion.movil.the_stallions.security.JwtUtils;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final FirebaseTokenService firebaseTokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtUtils jwtUtils, FirebaseTokenService firebaseTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.firebaseTokenService = firebaseTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("El correo ya está registrado");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setProvider(AuthProvider.LOCAL);

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (user.getProvider() != AuthProvider.LOCAL || user.getPasswordHash() == null) {
            throw new IllegalStateException("Esta cuenta usa inicio de sesión con Google");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse loginOrRegisterWithGoogle(GoogleAuthRequest request) {
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
            userRepository.save(user);
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getFullName());
    }
}