package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "Photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "visibilidad", nullable = false)
    @Enumerated(EnumType.STRING)
    private Visibilidad visibilidad;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "photo_data", columnDefinition = "LONGTEXT")
    private byte[] photoData;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "fecha_upload", nullable = false)
    private LocalDateTime fechaUpload;

    @Column(name = "usuarios_like", columnDefinition = "JSON")
    private String usuariosLike; // Almacenaremos los token/userId como JSON simple

    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Comment> comentarios;

    // Getters and Setters

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

    public Visibilidad getVisibilidad() {
        return visibilidad;
    }

    public void setVisibilidad(Visibilidad visibilidad) {
        this.visibilidad = visibilidad;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public byte[] getPhotoData() {
        return photoData;
    }

    public void setPhotoData(byte[] photoData) {
        this.photoData = photoData;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getFechaUpload() {
        return fechaUpload;
    }

    public void setFechaUpload(LocalDateTime fechaUpload) {
        this.fechaUpload = fechaUpload;
    }

    public Set<Comment> getComentarios() {
        return comentarios;
    }

    public void setComentarios(Set<Comment> comentarios) {
        this.comentarios = comentarios;
    }
}