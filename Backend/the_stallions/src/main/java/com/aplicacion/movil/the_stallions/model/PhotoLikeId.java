package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PhotoLikeId implements Serializable {

    @Column(name = "photo_id")
    private Long photoId;

    @Column(name = "user_id")
    private Long userId;

    public PhotoLikeId() {
    }

    public PhotoLikeId(Long photoId, Long userId) {
        this.photoId = photoId;
        this.userId = userId;
    }

    public Long getPhotoId() {
        return photoId;
    }

    public void setPhotoId(Long photoId) {
        this.photoId = photoId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PhotoLikeId that)) return false;
        return Objects.equals(photoId, that.photoId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(photoId, userId);
    }
}