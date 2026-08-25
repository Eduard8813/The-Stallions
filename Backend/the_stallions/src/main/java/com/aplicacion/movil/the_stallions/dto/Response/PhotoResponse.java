package com.aplicacion.movil.the_stallions.dto.Response;

public class PhotoResponse {
    private Long id;
    private String url;
    private String usuarioNombre;
    private String usuarioAvatar;
    private String fecha;
    private String visibilidad; // "privada" | "publica"
    private long likes;
    private boolean likedByMe;
    private long comentarios;

    public PhotoResponse() {
    }

    /** Constructor simple (solo URL) para usos existentes como el avatar de usuario. */
    public PhotoResponse(String url) {
        this.url = url;
    }

    public PhotoResponse(Long id, String url, String usuarioNombre, String usuarioAvatar,
                         String fecha, String visibilidad, long likes, boolean likedByMe, long comentarios) {
        this.id = id;
        this.url = url;
        this.usuarioNombre = usuarioNombre;
        this.usuarioAvatar = usuarioAvatar;
        this.fecha = fecha;
        this.visibilidad = visibilidad;
        this.likes = likes;
        this.likedByMe = likedByMe;
        this.comentarios = comentarios;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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
}
