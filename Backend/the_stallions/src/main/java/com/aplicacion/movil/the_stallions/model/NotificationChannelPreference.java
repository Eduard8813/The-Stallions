package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;

/**
 * Preferencia de entrega por canal dentro de una categoría
 * (email / push / inApp). Tabla normalizada.
 */
@Entity
@Table(name = "NotificationChannelPreferences")
public class NotificationChannelPreference {

    @EmbeddedId
    private NotificationChannelPreferenceId id;

    @Column(name = "Enabled", nullable = false)
    private boolean enabled;

    public NotificationChannelPreferenceId getId() {
        return id;
    }

    public void setId(NotificationChannelPreferenceId id) {
        this.id = id;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}