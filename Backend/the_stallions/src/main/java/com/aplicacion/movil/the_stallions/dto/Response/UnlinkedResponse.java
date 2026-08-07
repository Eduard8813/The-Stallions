package com.aplicacion.movil.the_stallions.dto.Response;

public class UnlinkedResponse {
    private boolean linked;

    public UnlinkedResponse(boolean linked) {
        this.linked = linked;
    }

    public boolean isLinked() {
        return linked;
    }

    public void setLinked(boolean linked) {
        this.linked = linked;
    }
}
