package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_destino_id", nullable = false)
    private User usuarioDestino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_origen_id")
    private User usuarioOrigen;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // "like", "comentario", "siguiendo", etc.

    @Column(name = "mensaje", length = 255)
    private String mensaje; // Mensaje breve tipo "Juan comentó tu foto"

    @Column(name = "relacion_id", length = 100)
    private String relacionId; // ID de la foto, evento, etc. relacionado

    @Column(name = "leida", nullable = false)
    private boolean leida;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUsuarioDestino() {
        return usuarioDestino;
    }

    public void setUsuarioDestino(User usuarioDestino) {
        this.usuarioDestino = usuarioDestino;
    }

    public User getUsuarioOrigen() {
        return usuarioOrigen;
    }

    public void setUsuarioOrigen(User usuarioOrigen) {
        this.usuarioOrigen = usuarioOrigen;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getRelacionId() {
        return relacionId;
    }

    public void setRelacionId(String relacionId) {
        this.relacionId = relacionId;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}