package com.aplicacion.movil.the_stallions.dto.Response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String usuarioNombre;
    private String texto;
    private String fecha;
    private boolean editado;

    public CommentResponse() {
    }

    public CommentResponse(Long id, String usuarioNombre, String texto, String fecha, boolean editado) {
        this.id = id;
        this.usuarioNombre = usuarioNombre;
        this.texto = texto;
        this.fecha = fecha;
        this.editado = editado;
    }
}