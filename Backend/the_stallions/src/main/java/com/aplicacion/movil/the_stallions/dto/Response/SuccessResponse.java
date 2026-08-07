package com.aplicacion.movil.the_stallions.dto.Response;

public class SuccessResponse {
    private boolean success;

    public SuccessResponse(boolean success) {
        this.success = success;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
