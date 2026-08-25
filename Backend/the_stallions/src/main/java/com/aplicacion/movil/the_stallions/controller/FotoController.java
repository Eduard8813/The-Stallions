package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import com.aplicacion.movil.the_stallions.dto.Response.PhotoResponse;
import com.aplicacion.movil.the_stallions.dto.Response.NotificationResponse;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.Notification;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.PhotoRepository;
import com.aplicacion.movil.the_stallions.repository.CommentRepository;
import com.aplicacion.movil.the_stallions.repository.NotificationRepository;
import com.aplicacion.movil.the_stallions.service.FotoService;
import com.aplicacion.movil.the_stallions.service.CommentService;
import com.aplicacion.movil.the_stallions.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fotos")
public class FotoController {

    @Autowired
    private FotoService fotoService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // ==================== FOTOS ====================

    /**
     * Subir una nueva foto
     * POST /api/fotos
     * Multipart/form-data: photo (archivo), visibilidad (privada o pública)
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Subir una nueva foto")
    @Parameters({
            @Parameter(name = "photo", description = "Archivo de imagen multipart", required = true, schema = @Schema(implementation = MultipartFile.class)),
            @Parameter(name = "visibilidad", description = "Visibilidad de la foto: privada o pública", required = true, schema = @Schema(allowableValues = {"privada", "publica"})),
            @Parameter(name = "Authorization", description = "Token JWT Bearer", required = true, schema = @Schema(type = "string", format = "jwt"))
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PhotoResponse> subirFoto(@RequestParam("photo") MultipartFile file,
                                                 @RequestParam("visibilidad") String visibilidad,
                                                 HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        PhotoResponse response = fotoService.subirFoto(file, visibilidad, token);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener las fotos del usuario autenticado
     * GET /api/fotos/mias
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Obtener fotos del usuario")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/mias")
    public ResponseEntity<List<PhotoResponse>> obtenerFotosMias(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        List<PhotoResponse> fotos = fotoService.obtenerFotosMias(token);
        return ResponseEntity.ok(fotos);
    }

    /**
     * Obtener fotos públicas de la comunidad
     * GET /api/fotos/comunidad
     */
    @Operation(summary = "Obtener fotos públicas de la comunidad")
    @GetMapping("/comunidad")
    public ResponseEntity<List<PhotoResponse>> obtenerFotosComunidad() {
        List<PhotoResponse> fotos = fotoService.obtenerFotosComunidad();
        return ResponseEntity.ok(fotos);
    }

    /**
     * Dar/quitar like a una foto
     * POST /api/fotos/{id}/like
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Like o a quitar like a una foto")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/like")
    public ResponseEntity<PhotoResponse> darLike(@PathVariable Long id, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        PhotoResponse response = fotoService.darLike(id, token);
        return ResponseEntity.ok(response);
    }

    // ==================== COMENTARIOS ====================

    /**
     * Obtener comentarios de una foto
     * GET /api/fotos/{id}/comentarios
     */
    @Operation(summary = "Obtener comentarios de una foto")
    @GetMapping("/{id}/comentarios")
    public ResponseEntity<List<CommentResponse>> obtenerComentarios(@PathVariable Long id) {
        List<CommentResponse> comentarios = commentService.obtenerComentarios(id);
        return ResponseEntity.ok(comentarios);
    }

    /**
     * Agregar un comentario a una foto
     * POST /api/fotos/{id}/comentarios
     * Body: { "texto": "texto del comentario" }
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Agregar un comentario a una foto")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<CommentResponse> agregarComentario(@PathVariable Long id,
                                                              @Valid @RequestBody CommentRequest request,
                                                              HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        CommentResponse response = commentService.agregarComentario(id, request.getTexto(), token);
        return ResponseEntity.ok(response);
    }

    /**
     * Editar un comentario propio
     * PUT /api/comentarios/{id}
     * Body: { "texto": "nuevo texto" }
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Editar un comentario propio")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/comentarios/{id}")
    public ResponseEntity<CommentResponse> editarComentario(@PathVariable Long id,
                                                            @Valid @RequestBody CommentRequest request,
                                                            HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        CommentResponse response = commentService.editarComentario(id, request.getTexto(), token);
        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar un comentario propio
     * DELETE /api/comentarios/{id}
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Eliminar un comentario propio")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/comentarios/{id}")
    public ResponseEntity<?> eliminarComentario(@PathVariable Long id, HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        commentService.eliminarComentario(id, token);
        return ResponseEntity.ok().build();
    }

    // ==================== NOTIFICACIONES ====================

    /**
     * Obtener notificaciones del usuario autenticado
     * GET /api/notificaciones
     * Header: Authorization: Bearer <token>
     */
    @Operation(summary = "Obtener notificaciones del usuario")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/notificaciones")
    public ResponseEntity<List<NotificationResponse>> obtenerNotificaciones(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        List<NotificationResponse> notificaciones = notificacionService.obtenerNotificaciones(token);
        return ResponseEntity.ok(notificaciones);
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