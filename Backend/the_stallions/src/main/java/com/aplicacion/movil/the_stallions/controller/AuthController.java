package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.*;
import com.aplicacion.movil.the_stallions.dto.Response.AuthResponse;
import com.aplicacion.movil.the_stallions.dto.Response.SuccessResponse;
import com.aplicacion.movil.the_stallions.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
                                                 @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, userAgent, clientIp));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
                                              @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp) {
        return ResponseEntity.ok(authService.login(request, userAgent, clientIp));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request,
                                                   @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
                                                   @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp) {
        return ResponseEntity.ok(authService.loginOrRegisterWithGoogle(request, userAgent, clientIp));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponse> verifyTwoFactor(@Valid @RequestBody VerifyTwoFactorRequest request,
                                                        @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
                                                        @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp) {
        return ResponseEntity.ok(authService.verifyTwoFactor(request, userAgent, clientIp));
    }

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            authService.logout(authorization.substring(7));
        }
        return ResponseEntity.ok(new SuccessResponse(true));
    }
}
