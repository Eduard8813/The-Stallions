package com.aplicacion.movil.the_stallions.dto.Response;

import lombok.Data;

@Data
public class CommentResponse {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String texto;
    private String fecha;
    private boolean editado;

    public CommentResponse() {
    }

    public CommentResponse(Long id, Long usuarioId, String usuarioNombre, String texto, String fecha, boolean editado) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.texto = texto;
        this.fecha = fecha;
        this.editado = editado;
    }
}
