package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import com.aplicacion.movil.the_stallions.dto.Response.NotificationResponse;
import com.aplicacion.movil.the_stallions.dto.Response.PhotoResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.Notification;
import com.aplicacion.movil.the_stallions.model.enums.Visibilidad;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.PhotoRepository;
import com.aplicacion.movil.the_stallions.repository.CommentRepository;
import com.aplicacion.movil.the_stallions.repository.NotificationRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FotoService {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Subir una nueva foto
     * - Valida token para obtener userId
     * - Guarda la imagen como blob en la entidad Photo
     * - Genera URL de acceso
     * - Asocia la foto al usuario con visibilidad especificada
     */
    public PhotoResponse subirFoto(MultipartFile file, String visibilidad, String token) {
        // Validar token y obtener userId
        String userId = validarTokenYObtenerUserId(token);

        // Validar archivo
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No se proporcionó ninguna imagen");
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("La imagen no puede superar los 10 MB");
        }

        try {
            // Buscar usuario
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

            // Crear entidad Photo
            Photo photo = new Photo();
            photo.setUser(user);
            photo.setVisibilidad(Visibilidad.valueOf(visibilidad.toUpperCase()));
            photo.setUrl(generarUrlFoto(user.getId(), photo.getId()));
            photo.setFechaUpload(LocalDateTime.now());

            // Guardar datos binarios
            byte[] bytes = file.getBytes();
            photo.setPhotoData(bytes);
            photo.setContentType(file.getContentType());
            photoRepository.save(photo);

            // Retornar respuesta con URL
            return new PhotoResponse(photo.getUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar la imagen", e);
        }
    }

    /**
     * Obtener las fotos del usuario autenticado
     */
    public List<PhotoResponse> obtenerFotosMias(String token) {
        String userId = validarTokenYObtenerUserId(token);
        List<Photo> fotos = photoRepository.findByUserIdAndVisibilidad(userId, Visibilidad.PUBLICA);
        return fotos.stream()
                .map(photo -> new PhotoResponse(photo.getUrl()))
                .collect(Collectors.toList());
    }

    /**
     * Obtener fotos públicas para la comunidad
     */
    public List<PhotoResponse> obtenerFotosComunidad() {
        List<Photo> fotos = photoRepository.findByVisibilidad(Visibilidad.PUBLICA);
        return fotos.stream()
                .map(photo -> {
                    try {
                        User user = userRepository.findById(photo.getUser().getId()).orElse(null);
                        return new PhotoResponse(photo.getUrl(), user != null ? user.getFullName() : "Desconocido");
                    } catch (Exception e) {
                        return new PhotoResponse(photo.getUrl());
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Dar/quitar like a una foto
     */
    public PhotoResponse darLike(Long id, String token) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));

        // Lógica de like - alternar entre liked y unliked
        if (photo.getUsuariosQueDieronLike() != null && photo.getUsuariosQueDieronLike().contains(token)) {
            photo.getUsuariosQueDieronLike().remove(token);
        } else {
            if (photo.getUsuariosQueDieronLike() == null) {
                photo.setUsuariosQueDieronLike(java.util.Collections.singletonList(token));
            } else {
                photo.getUsuariosQueDieronLike().add(token);
            }
        }

        photoRepository.save(photo);

        // Emitir notificación al dueño de la foto si quien da like no es el dueño
        // TODO: Obtener userId desde el token y notificar si es diferente

        return new PhotoResponse(photo.getUrl());
    }

    // ==================== MÉTODOS DE COMENTARIOS ====================

    /**
     * Obtener comentarios de una foto
     */
    public List<CommentResponse> obtenerComentarios(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));
        List<Comment> comentarios = commentRepository.findByPhotoOrderByFechaDesc(photo);
        return comentarios.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    /**
     * Agregar un comentario a una foto
     */
    public CommentResponse agregarComentario(Long id, String texto, String token) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));

        // Validar token y obtener userId
        String userId = validarTokenYObtenerUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Comment comentario = new Comment();
        comentario.setPhoto(photo);
        comentario.setUsuario(user);
        comentario.setTexto(texto);
        comentario.setFecha(LocalDateTime.now());
        comentario.setEditado(false);

        Comment saved = commentRepository.save(comentario);

        // Emitir notificación al dueño de la foto
        notificarNuevoComentario(photo.getUser(), user, photo);

        return convertirAResponse(saved);
    }

    /**
     * Editar un comentario propio
     */
    public CommentResponse editarComentario(Long comentidoId, String nuevoTexto, String token) {
        String userId = validarTokenYObtenerUserId(token);
        Comment comentario = commentRepository.findById(comentidoId)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado"));

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
        String userId = validarTokenYObtenerUserId(token);
        Comment comentario = commentRepository.findById(comentarioId)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado"));

        // Validar que el usuario sea el autor del comentario
        if (!comentario.getUsuario().getId().equals(userId)) {
            throw new SecurityException("No tienes permiso para eliminar este comentario");
        }

        commentRepository.delete(comentario);
    }

    // ==================== MÉTODOS DE NOTIFICACIONES ====================

    /**
     * Obtener notificaciones del usuario
     */
    public List<NotificationResponse> obtenerNotificaciones(String token) {
        String userId = validarTokenYObtenerUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return notificationRepository.findByUsuarioOrderByFechaDesc(user).stream()
                .map(this::convertirAResponseNotificacion)
                .collect(Collectors.toList());
    }

    // Métodos auxiliares privados

    private String validarTokenYObtenerUserId(String token) {
        // En un implementación real, aquí decodificaríamos el JWT
        // Por ahora, extraemos el userId del SecurityContext o lo validamos
        // Este es un placeholder que asume que el sistema ya validó el token
        // a través del filter JwtAuthenticationFilter
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId;
        try {
            userId = principal.toString();
        } catch (Exception e) {
            // Si no hay autenticación, intentar extraer del token manualmente
            // Esto es solo para desarrollo; en producción el filter ya debería haberlo puesto en el contexto
            throw new SecurityException("Token inválido o sesión expirada");
        }
        return userId;
    }

    private String generarUrlFoto(Long userId, Long photoId) {
        return baseUrl + "/api/user/photo/" + userId + "?fotoId=" + photoId;
    }

    private PhotoResponse convertirAResponse(Photo photo) {
        return new PhotoResponse(photo.getUrl());
    }

    private CommentResponse convertirAResponse(Comment comentario) {
        return new CommentResponse(
                comentario.getId(),
                comentario.getUsuario() != null ? comentario.getUsuario().getFullName() : "Anónimo",
                comentario.getTexto(),
                comentario.getFecha(),
                comentario.isEditado()
        );
    }

    private NotificationResponse convertirAResponseNotificacion(Notification notificacion) {
        return new NotificationResponse(
                notificacion.getId(),
                notificacion.getTipo(),
                notificacion.getUsuarioOrigen() != null ? notificacion.getUsuarioOrigen().getFullName() : "Sistema",
                notificacion.getFecha(),
                notificacion.isLeida()
        );
    }

    private void notificarNuevoComentario(User userFoto, User usuarioComentario, Photo photo) {
        // Crear notificación para el dueño de la foto
        Notification notificacion = new Notification();
        notificacion.setTipo("comentario");
        notificacion.setUsuarioOrigen(usuarioComentario);
        notificacion.setUsuarioDestino(userFoto);
        notificacion.setRelacionId(photo.getId().toString());
        notificacion.setLeida(false);
        notificacion.setFecha(LocalDateTime.now());

        notificationRepository.save(notificacion);
    }
}