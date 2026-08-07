package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotNull;

public class TwoFactorRequest {

    @NotNull(message = "El estado de la verificación es obligatorio")
    private Boolean enabled;

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
