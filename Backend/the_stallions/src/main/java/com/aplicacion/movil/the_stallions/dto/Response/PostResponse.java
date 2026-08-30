package com.aplicacion.movil.the_stallions.dto.Response;

import java.util.ArrayList;
import java.util.List;

/**
 * Representa UN post de la comunidad. Puede contener una o varias fotos
 * (las que se subieron juntas) que se muestran como un carrusel.
 */
public class PostResponse {
    private Long id; // id representativo del post (grupoId o id de la foto única)
    private String usuarioNombre;
    private String usuarioAvatar;
    private String fecha;
    private String visibilidad; // "privada" | "publica"
    private String descripcion;
    private long likes;      // agregado de todas las fotos del post
    private boolean likedByMe;
    private long comentarios; // agregado de todas las fotos del post
    private List<PhotoResponse> fotos = new ArrayList<>();

    public PostResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioAvatar() {
        return usuarioAvatar;
    }

    public void setUsuarioAvatar(String usuarioAvatar) {
        this.usuarioAvatar = usuarioAvatar;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getVisibilidad() {
        return visibilidad;
    }

    public void setVisibilidad(String visibilidad) {
        this.visibilidad = visibilidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public long getLikes() {
        return likes;
    }

    public void setLikes(long likes) {
        this.likes = likes;
    }

    public boolean isLikedByMe() {
        return likedByMe;
    }

    public void setLikedByMe(boolean likedByMe) {
        this.likedByMe = likedByMe;
    }

    public long getComentarios() {
        return comentarios;
    }

    public void setComentarios(long comentarios) {
        this.comentarios = comentarios;
    }

    public List<PhotoResponse> getFotos() {
        return fotos;
    }

    public void setFotos(List<PhotoResponse> fotos) {
        this.fotos = fotos;
    }
}
