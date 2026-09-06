package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;

/**
 * Preferencia habilitada/deshabilitada por categoría de notificación
 * (tabla normalizada, sustituye al JSON de UserNotifications).
 */
@Entity
@Table(name = "NotificationCategoryPreferences")
public class NotificationCategoryPreference {

    @EmbeddedId
    private NotificationCategoryPreferenceId id;

    @Column(name = "Enabled", nullable = false)
    private boolean enabled;

    public NotificationCategoryPreferenceId getId() {
        return id;
    }

    public void setId(NotificationCategoryPreferenceId id) {
        this.id = id;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}