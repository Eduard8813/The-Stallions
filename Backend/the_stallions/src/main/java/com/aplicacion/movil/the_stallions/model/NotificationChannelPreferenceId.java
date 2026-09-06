package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class NotificationChannelPreferenceId implements Serializable {

    @Column(name = "UserId")
    private Long userId;

    @Column(name = "Category", length = 50)
    private String category;

    @Column(name = "Channel", length = 50)
    private String channel;

    public NotificationChannelPreferenceId() {
    }

    public NotificationChannelPreferenceId(Long userId, String category, String channel) {
        this.userId = userId;
        this.category = category;
        this.channel = channel;
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

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof NotificationChannelPreferenceId that)) return false;
        return Objects.equals(userId, that.userId)
                && Objects.equals(category, that.category)
                && Objects.equals(channel, that.channel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, category, channel);
    }
}