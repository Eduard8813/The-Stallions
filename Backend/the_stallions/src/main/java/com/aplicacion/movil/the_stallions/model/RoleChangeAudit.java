package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Registro inmutable de cada cambio de rol realizado por un administrador.
 * Permite al rol {@code AUDITOR} revisar quién modificó qué y cuándo.
 */
@Entity
@Table(name = "RoleChangeAudit")
public class RoleChangeAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @Column(name = "ChangedById")
    private Long changedById;

    @Column(name = "ChangedByEmail", length = 150)
    private String changedByEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "FromRole", length = 20)
    private Rol fromRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "ToRole", length = 20)
    private Rol toRole;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getChangedById() {
        return changedById;
    }

    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }

    public String getChangedByEmail() {
        return changedByEmail;
    }

    public void setChangedByEmail(String changedByEmail) {
        this.changedByEmail = changedByEmail;
    }

    public Rol getFromRole() {
        return fromRole;
    }

    public void setFromRole(Rol fromRole) {
        this.fromRole = fromRole;
    }

    public Rol getToRole() {
        return toRole;
    }

    public void setToRole(Rol toRole) {
        this.toRole = toRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}