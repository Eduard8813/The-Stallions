package com.aplicacion.movil.the_stallions.dto.Response;

public class SecurityResponse {
    private boolean twoFactorEnabled;

    public SecurityResponse() {
    }

    public SecurityResponse(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }
}
