package com.aplicacion.movil.the_stallions.dto.Response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String tipo;
    private String usuarioNombre;
    private String mensaje;
    private String fecha;
    private boolean leida;

    public NotificationResponse() {
    }

    public NotificationResponse(Long id, String tipo, String usuarioNombre, String fecha, boolean leida) {
        this.id = id;
        this.tipo = tipo;
        this.usuarioNombre = usuarioNombre;
        this.fecha = fecha;
        this.leida = leida;
    }

    // Constructor con mensaje adicional
    public NotificationResponse(Long id, String tipo, String usuarioOrigen, String mensaje, String fecha, boolean leida) {
        this.id = id;
        this.tipo = tipo;
        // Extraer nombre del usuario del mensaje si está formateado como "Juan comentó tu foto"
        this.usuarioNombre = usuarioOrigen != null ? usuarioOrigen : "Usuario";
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.leida = leida;
    }
}