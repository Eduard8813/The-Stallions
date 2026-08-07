package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;

@Entity
@Table(name = "UserPrivacy")
public class UserPrivacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @Column(name = "Visibility", nullable = false, length = 20)
    private String visibility = "public";

    @Column(name = "ShowEmail", nullable = false)
    private boolean showEmail = false;

    @Column(name = "ShowPhone", nullable = false)
    private boolean showPhone = false;

    @Column(name = "ShowLocation", nullable = false)
    private boolean showLocation = false;

    @Column(name = "Discoverable", nullable = false)
    private boolean discoverable = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public boolean isShowEmail() {
        return showEmail;
    }

    public void setShowEmail(boolean showEmail) {
        this.showEmail = showEmail;
    }

    public boolean isShowPhone() {
        return showPhone;
    }

    public void setShowPhone(boolean showPhone) {
        this.showPhone = showPhone;
    }

    public boolean isShowLocation() {
        return showLocation;
    }

    public void setShowLocation(boolean showLocation) {
        this.showLocation = showLocation;
    }

    public boolean isDiscoverable() {
        return discoverable;
    }

    public void setDiscoverable(boolean discoverable) {
        this.discoverable = discoverable;
    }
}
