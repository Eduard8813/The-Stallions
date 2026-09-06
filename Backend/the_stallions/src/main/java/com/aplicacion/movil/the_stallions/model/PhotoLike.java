package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Registro de "me gusta" de una foto de la comunidad.
 * Clave compuesta (photo_id, user_id): 1FN/3FN, alineado con el ER normalizado.
 */
@Entity
@Table(name = "PhotoLikes")
public class PhotoLike {

    @EmbeddedId
    private PhotoLikeId id;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    public PhotoLikeId getId() {
        return id;
    }

    public void setId(PhotoLikeId id) {
        this.id = id;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}