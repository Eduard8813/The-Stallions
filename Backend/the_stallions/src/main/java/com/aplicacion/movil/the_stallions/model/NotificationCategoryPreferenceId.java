package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class NotificationCategoryPreferenceId implements Serializable {

    @Column(name = "UserId")
    private Long userId;

    @Column(name = "Category", length = 50)
    private String category;

    public NotificationCategoryPreferenceId() {
    }

    public NotificationCategoryPreferenceId(Long userId, String category) {
        this.userId = userId;
        this.category = category;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof NotificationCategoryPreferenceId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(category, that.category);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, category);
    }
}