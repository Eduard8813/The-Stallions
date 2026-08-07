package com.aplicacion.movil.the_stallions.dto.Response;

public class DataExportResponse {
    private String exportId;
    private String status;
    private int availableForHours;

    public String getExportId() {
        return exportId;
    }

    public void setExportId(String exportId) {
        this.exportId = exportId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAvailableForHours() {
        return availableForHours;
    }

    public void setAvailableForHours(int availableForHours) {
        this.availableForHours = availableForHours;
    }
}
