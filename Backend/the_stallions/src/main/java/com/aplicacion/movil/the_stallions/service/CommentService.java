package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.repository.CommentRepository;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.PhotoRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.security.Principal;
import java.time.LocalDateTime;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhotoRepository photoRepository;

    /**
     * Obtener comentarios de una foto
     */
    public List<CommentResponse> obtenerComentarios(Long fotoId) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new IllegalArgumentException("Foto no encontrada"));

        return commentRepository.findByPhotoOrderByFechaDesc(photo).stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    /**
     * Agregar un comentario a una foto
     */
    public CommentResponse agregarComentario(Long fotoId, String texto, String token) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new IllegalArgumentException("Foto no encontrada"));

        // Obtener usuario desde el token
        String userId = obtenerUserIdDesdeToken();
        User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Comment comentario = new Comment();
        comentario.setPhoto(photo);
        comentario.setUsuario(usuario);
        comentario.setTexto(texto);
        comentario.setFecha(LocalDateTime.now());
        comentario.setEditado(false);

        Comment saved = commentRepository.save(comentario);
        return convertirAResponse(saved);
    }

    /**
     * Editar un comentario propio
     */
    public CommentResponse editarComentario(Long comentarioId, String nuevoTexto, String token) {
        // Obtener usuario desde el token (extraído del contexto de la request)
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        String tokenFromRequest = request.getHeader("Authorization");
        if (tokenFromRequest != null && tokenFromRequest.startsWith("Bearer ")) {
            tokenFromRequest = tokenFromRequest.substring(7);
        }

        String userId = obtenerUserIdDesdeToken(request);
        Comment comentario = commentRepository.findById(comentarioId)
                .orElseThrow(() -> new IllegalArgumentException("Comentario no encontrado"));

        // Validar que el usuario sea el autor del comentario
        if (!comentario.getUsuario().getId().equals(userId)) {
            throw new SecurityException("No tienes permiso para editar este comentario");
        }

        comentario.setTexto(nuevoTexto);
        comentario.setEditado(true);
        Comment saved = commentRepository.save(comentario);
        return convertirAResponse(saved);
    }

    /**
     * Eliminar un comentario propio
     */
    public void eliminarComentario(Long comentarioId, String token) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        String tokenFromRequest = request.getHeader("Authorization");
        if (tokenFromRequest != null && tokenFromRequest.startsWith("Bearer ")) {
            tokenFromRequest = tokenFromRequest.substring(7);
        }

        String userId = obtenerUserIdDesdeToken(request);
        Comment comentario = commentRepository.findById(comentarioId)
                .orElseThrow(() -> new IllegalArgumentException("Comentario no encontrado"));

        // Validar que el usuario sea el autor del comentario
        if (!comentario.getUsuario().getId().equals(userId)) {
            throw new SecurityException("No tienes permiso para eliminar este comentario");
        }

        commentRepository.delete(comentario);
    }

    private String obtenerUserIdDesdeToken() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        Principal principal = request.getUserPrincipal();
        if (principal != null) {
            return principal.toString();
        }
        // Fallback: intentar del header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String obtenerUserIdDesdeToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        Principal principal = request.getUserPrincipal();
        if (principal != null) {
            return principal.toString();
        }
        return null;
    }

    private CommentResponse convertirAResponse(Comment comentario) {
        return new CommentResponse(
                comentario.getId(),
                comentario.getUsuario() != null ? comentario.getUsuario().getFullName() : "Anónimo",
                comentario.getTexto(),
                comentario.getFecha().toString(),
                comentario.isEditado()
        );
    }
}