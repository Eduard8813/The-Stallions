package com.aplicacion.movil.the_stallions.dto.Response;

public class SecurityResponse {
    private boolean twoFactorEnabled;
    private String secret;
    private String otpAuthUrl;

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

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getOtpAuthUrl() {
        return otpAuthUrl;
    }

    public void setOtpAuthUrl(String otpAuthUrl) {
        this.otpAuthUrl = otpAuthUrl;
    }
}
