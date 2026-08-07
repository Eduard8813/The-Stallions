package com.aplicacion.movil.the_stallions.dto.Response;

public class UnblockedResponse {
    private boolean unblocked;

    public UnblockedResponse(boolean unblocked) {
        this.unblocked = unblocked;
    }

    public boolean isUnblocked() {
        return unblocked;
    }

    public void setUnblocked(boolean unblocked) {
        this.unblocked = unblocked;
    }
}
