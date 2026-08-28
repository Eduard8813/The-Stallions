package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import com.aplicacion.movil.the_stallions.dto.Response.NotificationResponse;
import com.aplicacion.movil.the_stallions.dto.Response.PhotoResponse;
import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.service.CommentService;
import com.aplicacion.movil.the_stallions.service.FotoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fotos")
public class FotoController {

    @Autowired
    private FotoService fotoService;

    @Autowired
    private CommentService commentService;

    // ==================== FOTOS ====================

    /**
     * Subir una nueva foto
     * POST /api/fotos
     * Multipart/form-data: photo (archivo), visibilidad (privada | publica), descripcion (opcional)
     */


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PhotoResponse> subirFoto(@RequestParam("photo") MultipartFile photo,
                                                   @RequestParam("visibilidad") String visibilidad,
                                                   @RequestParam(value = "descripcion", required = false) String descripcion) {
        User usuario = fotoService.usuarioActual();
        return ResponseEntity.ok(fotoService.subirFoto(photo, visibilidad, descripcion, usuario));
    }

    /** GET /api/fotos/mias — fotos privadas y públicas del usuario autenticado */


    @GetMapping("/mias")
    public ResponseEntity<List<PhotoResponse>> obtenerFotosMias() {
        User usuario = fotoService.usuarioActual();
        return ResponseEntity.ok(fotoService.obtenerFotosMias(usuario));
    }

    /** GET /api/fotos/comunidad?page=1&pageSize=10 — solo fotos públicas, paginadas */

    @GetMapping("/comunidad")
    public ResponseEntity<List<PhotoResponse>> obtenerFotosComunidad(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        User actual = fotoService.usuarioOpcional();
        return ResponseEntity.ok(fotoService.obtenerFotosComunidad(actual, page, pageSize));
    }

    /** PUT /api/fotos/{id} — cambiar visibilidad de una foto propia. Body: { "visibilidad": "publica" } */


    @PutMapping("/{id}")
    public ResponseEntity<PhotoResponse> cambiarVisibilidad(@PathVariable Long id,
                                                           @Valid @RequestBody Map<String, String> body) {
        User usuario = fotoService.usuarioActual();
        return ResponseEntity.ok(fotoService.cambiarVisibilidad(id, body.get("visibilidad"), usuario));
    }

    /** DELETE /api/fotos/{id} — eliminar una foto propia */


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFoto(@PathVariable Long id) {
        User usuario = fotoService.usuarioActual();
        fotoService.eliminarFoto(id, usuario);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/fotos/{id}/imagen — bytes de la imagen (privadas solo para el dueño) */

    @GetMapping("/{id}/imagen")
    public ResponseEntity<byte[]> obtenerImagen(@PathVariable Long id) {
        Photo photo = fotoService.obtenerFotoConDatos(id, fotoService.usuarioOpcional());
        String contentType = photo.getContentType() != null ? photo.getContentType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(photo.getPhotoData());
    }

    // ==================== LIKES ====================

    /** POST /api/fotos/{id}/like — toggle like del usuario autenticado */


    @PostMapping("/{id}/like")
    public ResponseEntity<PhotoResponse> darLike(@PathVariable Long id) {
        User usuario = fotoService.usuarioActual();
        return ResponseEntity.ok(fotoService.darLike(id, usuario));
    }

    // ==================== COMENTARIOS ====================

    /** GET /api/fotos/{id}/comentarios */

    @GetMapping("/{id}/comentarios")
    public ResponseEntity<List<CommentResponse>> obtenerComentarios(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.obtenerComentarios(id));
    }

    /** POST /api/fotos/{id}/comentarios — body: { "texto": "..." } */


    @PostMapping("/{id}/comentarios")
    public ResponseEntity<CommentResponse> agregarComentario(@PathVariable Long id,
                                                             @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.agregarComentario(id, request.getTexto()));
    }

    /** PUT /api/comentarios/{id} — editar un comentario propio */


    @PutMapping("/comentarios/{id}")
    public ResponseEntity<CommentResponse> editarComentario(@PathVariable Long id,
                                                            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.editarComentario(id, request.getTexto()));
    }

    /** DELETE /api/comentarios/{id} — eliminar un comentario propio */


    @DeleteMapping("/comentarios/{id}")
    public ResponseEntity<Void> eliminarComentario(@PathVariable Long id) {
        commentService.eliminarComentario(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== NOTIFICACIONES ====================

    /** GET /api/fotos/notificaciones — notificaciones del usuario autenticado */


    @GetMapping("/notificaciones")
    public ResponseEntity<List<NotificationResponse>> obtenerNotificaciones() {
        User usuario = fotoService.usuarioActual();
        return ResponseEntity.ok(fotoService.obtenerNotificaciones(usuario));
    }

    /** PUT /api/fotos/notificaciones/{id}/leida — marcar como leída */


    @PutMapping("/notificaciones/{id}/leida")
    public ResponseEntity<Void> marcarNotificacionLeida(@PathVariable Long id) {
        User usuario = fotoService.usuarioActual();
        fotoService.marcarNotificacionLeida(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // DTO interno para requests de comentario
    public static class CommentRequest {
        private String texto;

        public String getTexto() {
            return texto;
        }

        public void setTexto(String texto) {
            this.texto = texto;
        }
    }
}
