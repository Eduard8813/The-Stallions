package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;

/**
 * Horas de silencio de notificaciones de un usuario (una fila por usuario).
 * Sustituye a los campos quietHours del JSON de UserNotifications.
 */
@Entity
@Table(name = "NotificationQuietHours")
public class NotificationQuietHours {

    @Id
    @Column(name = "UserId")
    private Long userId;

    @Column(name = "Enabled", nullable = false)
    private boolean enabled;

    @Column(name = "StartTime", length = 5)
    private String start;

    @Column(name = "EndTime", length = 5)
    private String end;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }
}