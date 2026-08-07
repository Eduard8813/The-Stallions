package com.aplicacion.movil.the_stallions.dto.Response;

public class PhotoResponse {
    private String photoUrl;

    public PhotoResponse(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
