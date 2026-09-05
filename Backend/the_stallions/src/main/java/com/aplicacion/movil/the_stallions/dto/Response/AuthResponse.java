package com.aplicacion.movil.the_stallions.dto.Response;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String rol;
    private Boolean requiresTwoFactor;
    private String challengeId;

    public AuthResponse(String token, String email, String fullName) {
        this(token, email, fullName, null, null, null);
    }

    public AuthResponse(String token, String email, String fullName, String rol) {
        this(token, email, fullName, rol, null, null);
    }

    public AuthResponse(String token, String email, String fullName, Boolean requiresTwoFactor, String challengeId) {
        this(token, email, fullName, null, requiresTwoFactor, challengeId);
    }

    public AuthResponse(String token, String email, String fullName, String rol,
                        Boolean requiresTwoFactor, String challengeId) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.rol = rol;
        this.requiresTwoFactor = requiresTwoFactor;
        this.challengeId = challengeId;
    }

    // getters y setters

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Boolean getRequiresTwoFactor() {
        return requiresTwoFactor;
    }

    public void setRequiresTwoFactor(Boolean requiresTwoFactor) {
        this.requiresTwoFactor = requiresTwoFactor;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }
}
