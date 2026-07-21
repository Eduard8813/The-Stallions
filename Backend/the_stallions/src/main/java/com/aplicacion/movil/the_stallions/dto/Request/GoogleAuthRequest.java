package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {
    @NotBlank
    private String idToken; // token emitido por Firebase/Google en el frontend

    // getters y setters

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}