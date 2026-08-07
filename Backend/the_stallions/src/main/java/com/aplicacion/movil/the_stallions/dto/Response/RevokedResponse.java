package com.aplicacion.movil.the_stallions.dto.Response;

public class RevokedResponse {
    private boolean revoked;

    public RevokedResponse(boolean revoked) {
        this.revoked = revoked;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }
}
