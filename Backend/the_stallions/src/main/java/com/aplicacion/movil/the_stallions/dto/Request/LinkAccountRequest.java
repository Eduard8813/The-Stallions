package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class LinkAccountRequest {

    @NotBlank(message = "El proveedor es obligatorio")
    private String provider;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
