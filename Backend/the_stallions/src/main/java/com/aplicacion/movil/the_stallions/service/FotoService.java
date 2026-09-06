package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import com.aplicacion.movil.the_stallions.dto.Response.NotificationResponse;
import com.aplicacion.movil.the_stallions.dto.Response.PhotoResponse;
import com.aplicacion.movil.the_stallions.dto.Response.PostResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.Notification;
import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.PhotoLike;
import com.aplicacion.movil.the_stallions.model.PhotoLikeId;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.Visibilidad;
import com.aplicacion.movil.the_stallions.repository.CommentRepository;
import com.aplicacion.movil.the_stallions.repository.NotificationRepository;
import com.aplicacion.movil.the_stallions.repository.PhotoLikeRepository;
import com.aplicacion.movil.the_stallions.repository.PhotoRepository;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FotoService {

    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PhotoLikeRepository photoLikeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.base-url}")
    private String baseUrl;

    // ==================== FOTOS ====================

    /**
     * Subir una nueva foto. El usuario se obtiene desde el token (SecurityContext),
     * nunca desde un valor enviado por el cliente.
     * Si `grupoId` no es nulo, la foto se agrupa con otras que compartan ese mismo
     * grupo para mostrarse juntas en un solo post (carrusel) de la comunidad.
     */
    public PhotoResponse subirFoto(MultipartFile file, String visibilidad, String descripcion, User usuario, Long grupoId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No se proporcionó ninguna imagen");
        }
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("La imagen no puede superar los 10 MB");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el archivo de imagen");
        }
        if (bytes.length == 0) {
            throw new IllegalArgumentException("El archivo de imagen está vacío");
        }

        Visibilidad vis = parseVisibilidad(visibilidad);

        Photo photo = new Photo();
        photo.setUser(usuario);
        photo.setVisibilidad(vis);
        photo.setDescripcion(descripcion != null ? descripcion.trim() : null);
        photo.setFechaUpload(LocalDateTime.now());
        photo.setGrupoId(grupoId);
        photo.setPhotoData(bytes);
        // Content type real del archivo, o fallback razonable según extensión.
        photo.setContentType(resolverContentType(file));
        // La columna `url` es NOT NULL en la BD, así que nunca se inserta null:
        // se usa un placeholder y se reemplaza por la URL definitiva tras obtener el id.
        photo.setUrl(publicBaseUrl() + "/api/fotos/pending/imagen");

        Photo saved = photoRepository.saveAndFlush(photo);
        saved.setUrl(publicBaseUrl() + "/api/fotos/" + saved.getId() + "/imagen");
        saved = photoRepository.save(saved);

        return desde(saved, usuario);
    }

    /** Todas las fotos (privadas y públicas) del usuario autenticado. */
    public List<PhotoResponse> obtenerFotosMias(User usuario) {
        return photoRepository.findByUserIdOrderByFechaUploadDesc(usuario.getId()).stream()
                .map(p -> desde(p, usuario))
                .collect(Collectors.toList());
    }

    /** Solo fotos públicas de cualquier usuario, con paginación. */
    public List<PhotoResponse> obtenerFotosComunidad(User actual, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), Math.min(Math.max(pageSize, 1), 50));
        return photoRepository.findByVisibilidadOrderByFechaUploadDesc(Visibilidad.PUBLICA, pageable)
                .getContent().stream()
                .map(p -> desde(p, actual))
                .collect(Collectors.toList());
    }

    /**
     * Posts de la comunidad (solo públicos), con paginación.
     * Las fotos que comparten un mismo grupoId se agrupan en UN post (carrusel),
     * de modo que las fotos subidas juntas aparecen juntas en el mismo lugar.
     */
    public List<PostResponse> obtenerPostsComunidad(User actual, int page, int pageSize) {
        List<Photo> todas = photoRepository.findByVisibilidadOrderByFechaUploadDesc(Visibilidad.PUBLICA);

        // Oculta el contenido de cuentas suspendidas (enabled=false).
        todas = todas.stream()
                .filter(p -> p.getUser() == null || p.getUser().isEnabled())
                .collect(Collectors.toList());

        List<List<Photo>> grupos = agruparEnPosts(todas);

        int inicio = Math.max(page - 1, 0) * Math.min(Math.max(pageSize, 1), 50);
        if (inicio >= grupos.size()) {
            return new ArrayList<>();
        }
        int fin = Math.min(inicio + Math.min(Math.max(pageSize, 1), 50), grupos.size());

        return grupos.subList(inicio, fin).stream()
                .map(g -> fromPosts(g, actual))
                .collect(Collectors.toList());
    }

    /**
     * Agrupa fotos ya ordenadas por fecha desc en posts.
     * Fotos consecutivas con el mismo grupoId van juntas en un mismo post;
     * una foto sin grupoId es un post de una sola foto.
     */
    private List<List<Photo>> agruparEnPosts(List<Photo> ordenadas) {
        List<List<Photo>> grupos = new ArrayList<>();
        for (Photo p : ordenadas) {
            if (p.getGrupoId() == null) {
                grupos.add(new ArrayList<>(List.of(p)));
                continue;
            }
            List<Photo> ultimo = grupos.isEmpty() ? null : grupos.get(grupos.size() - 1);
            if (ultimo != null && !ultimo.isEmpty() && p.getGrupoId().equals(ultimo.get(0).getGrupoId())) {
                ultimo.add(p);
            } else {
                grupos.add(new ArrayList<>(List.of(p)));
            }
        }
        return grupos;
    }

    private PostResponse fromPosts(List<Photo> fotos, User actual) {
        Photo principal = fotos.get(0);
        PostResponse post = new PostResponse();
        post.setId(principal.getGrupoId() != null ? principal.getGrupoId() : principal.getId());
        User dueno = principal.getUser();
        post.setUsuarioNombre(dueno != null ? dueno.getFullName() : "Usuario");
        post.setUsuarioAvatar(dueno != null ? baseUrl + "/api/user/photo/" + dueno.getId() : null);
        post.setFecha(principal.getFechaUpload() != null
                ? principal.getFechaUpload().format(FECHA_FORMATO) : null);
        post.setVisibilidad(principal.getVisibilidad() == Visibilidad.PUBLICA ? "publica" : "privada");
        post.setDescripcion(principal.getDescripcion());

        long likes = 0;
        long comentarios = 0;
        boolean likedByMe = false;
        Long miId = actual != null ? actual.getId() : null;
        for (Photo f : fotos) {
            likes += photoLikeRepository.countByIdPhotoId(f.getId());
            comentarios += commentRepository.countByPhoto(f);
            if (!likedByMe && miId != null
                    && photoLikeRepository.existsByIdPhotoIdAndIdUserId(f.getId(), miId)) {
                likedByMe = true;
            }
        }
        post.setLikes(likes);
        post.setComentarios(comentarios);
        post.setLikedByMe(likedByMe);
        post.setFotos(fotos.stream().map(f -> desde(f, actual)).collect(Collectors.toList()));
        return post;
    }

    /** Cambiar visibilidad de una foto propia. */
    public PhotoResponse cambiarVisibilidad(Long fotoId, String visibilidad, User usuario) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));
        validarDueno(photo, usuario);
        photo.setVisibilidad(parseVisibilidad(visibilidad));
        return desde(photoRepository.save(photo), usuario);
    }

    /** Eliminar una foto propia (registro + datos). */
    public void eliminarFoto(Long fotoId, User usuario) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));
        validarDueno(photo, usuario);
        commentRepository.findByPhotoOrderByFechaAsc(photo).forEach(commentRepository::delete);
        photoLikeRepository.deleteByIdPhotoId(fotoId);
        photoRepository.delete(photo);
    }

    /**
     * Dar/quitar like (toggle) a una foto.
     * Los likes se guardan en la tabla normalizada PhotoLikes (photo_id, user_id).
     * Genera notificación para el dueño si quien da like no es él mismo.
     */
    public PhotoResponse darLike(Long fotoId, User usuario) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));

        PhotoLikeId id = new PhotoLikeId(fotoId, usuario.getId());
        boolean yaDioLike = photoLikeRepository.existsById(id);

        if (yaDioLike) {
            photoLikeRepository.deleteById(id);
        } else {
            PhotoLike like = new PhotoLike();
            like.setId(id);
            like.setFecha(LocalDateTime.now());
            photoLikeRepository.save(like);
            notificar(photo.getUser(), usuario, "like", photo);
        }

        return desde(photo, usuario);
    }

    // ==================== IMAGEN ====================

    /** Devuelve los bytes de la imagen (privadas solo para su dueño). */
    public Photo obtenerFotoConDatos(Long fotoId, User actual) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));
        if (photo.getVisibilidad() == Visibilidad.PRIVADA) {
            validarDueno(photo, actual);
        }
        return photo;
    }

    // ==================== COMENTARIOS ====================

    public List<CommentResponse> obtenerComentarios(Long fotoId) {
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));
        return commentRepository.findByPhotoOrderByFechaAsc(photo).stream()
                .filter(c -> c.getUsuario() == null || c.getUsuario().isEnabled())
                .map(this::desde)
                .collect(Collectors.toList());
    }

    public CommentResponse agregarComentario(Long fotoId, String texto, User autor) {
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException("El comentario no puede estar vacío");
        }
        Photo photo = photoRepository.findById(fotoId)
                .orElseThrow(() -> new NotFoundException("Foto no encontrada"));

        Comment comentario = new Comment();
        comentario.setPhoto(photo);
        comentario.setUsuario(autor);
        comentario.setTexto(texto.trim());
        comentario.setFecha(LocalDateTime.now());
        comentario.setEditado(false);
        Comment saved = commentRepository.save(comentario);

        notificar(photo.getUser(), autor, "comentario", photo);
        return desde(saved);
    }

    public CommentResponse editarComentario(Long comentarioId, String nuevoTexto, User usuario) {
        Comment comentario = commentRepository.findById(comentarioId)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado"));
        validarAutor(comentario, usuario);
        comentario.setTexto(nuevoTexto.trim());
        comentario.setEditado(true);
        return desde(commentRepository.save(comentario));
    }

    public void eliminarComentario(Long comentarioId, User usuario) {
        Comment comentario = commentRepository.findById(comentarioId)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado"));
        validarAutor(comentario, usuario);
        commentRepository.delete(comentario);
    }

    // ==================== NOTIFICACIONES ====================

    public List<NotificationResponse> obtenerNotificaciones(User usuario) {
        return notificationRepository.findByUsuarioDestinoOrderByFechaDesc(usuario).stream()
                .map(this::desdeNotificacion)
                .collect(Collectors.toList());
    }

    public void marcarNotificacionLeida(Long id, User usuario) {
        Notification n = notificationRepository.findByIdAndUsuarioDestino(id, usuario)
                .orElseThrow(() -> new NotFoundException("Notificación no encontrada"));
        n.setLeida(true);
        notificationRepository.save(n);
    }

    // ==================== USUARIO ACTUAL (desde token) ====================

    /**
     * Obtiene el usuario autenticado desde el SecurityContext.
     * El JwtAuthenticationFilter coloca el email como principal.
     */
    public User usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String email)) {
            throw new SecurityException("Token inválido o sesión expirada");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Usuario no encontrado"));
    }

    /** Igual que usuarioActual() pero devuelve null si no hay sesión (endpoints públicos). */
    public User usuarioOpcional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String email)) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Resuelve el usuario a partir de un token JWT enviado como query param
     * (necesario para que <Image> de React Native pueda cargar fotos privadas propias,
     * ya que no envía el header Authorization). Devuelve null si el token es inválido.
     */
    public User usuarioDesdeQueryToken(String token) {
        if (token == null || token.isBlank()) return null;
        try {
            if (!jwtUtils.isTokenValid(token)) return null;
            String email = jwtUtils.getEmailFromToken(token);
            return email == null ? null : userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // ==================== AUXILIARES ====================

    private Visibilidad parseVisibilidad(String valor) {
        try {
            return Visibilidad.valueOf(valor.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Visibilidad inválida: use 'privada' o 'publica'");
        }
    }

    /**
     * Resuelve el content type de la imagen. Acepta cualquier tipo de imagen.
     * Si el header no viene (o es un tipo genérico), infiere desde la extensión.
     */
    private String resolverContentType(MultipartFile file) {
        String ct = file.getContentType();
        if (ct != null && !ct.isBlank()) {
            return ct;
        }
        String nombre = file.getOriginalFilename();
        if (nombre != null) {
            String lower = nombre.toLowerCase();
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".gif")) return "image/gif";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".bmp")) return "image/bmp";
            if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
            if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
        }
        return "image/jpeg";
    }

    /**
     * Si app.base-url está configurado lo usa; si no, devuelve vacío para que
     * el front resuelva la URL relativa con su propio host. Nunca guarda una URL rota.
     */
    private String publicBaseUrl() {
        if (baseUrl != null && !baseUrl.isBlank()) {
            return baseUrl.replaceAll("/+$", "");
        }
        return "";
    }

    private void validarDueno(Photo photo, User usuario) {
        if (!photo.getUser().getId().equals(usuario.getId())) {
            throw new SecurityException("No tienes permiso sobre esta foto");
        }
    }

    private void validarAutor(Comment comentario, User usuario) {
        if (!comentario.getUsuario().getId().equals(usuario.getId())) {
            throw new SecurityException("No tienes permiso sobre este comentario");
        }
    }

    private void notificar(User destino, User origen, String tipo, Photo photo) {
        if (destino.getId().equals(origen.getId())) {
            return; // no notificarse a sí mismo
        }
        Notification n = new Notification();
        n.setTipo(tipo);
        n.setUsuarioOrigen(origen);
        n.setUsuarioDestino(destino);
        n.setRelacionId(String.valueOf(photo.getId()));
        n.setLeida(false);
        n.setFecha(LocalDateTime.now());
        notificationRepository.save(n);
    }

    private PhotoResponse desde(Photo p, User actual) {
        Long miId = actual != null ? actual.getId() : null;
        boolean likedByMe = miId != null
                && photoLikeRepository.existsByIdPhotoIdAndIdUserId(p.getId(), miId);
        User dueno = p.getUser();
        PhotoResponse response = new PhotoResponse(
                p.getId(),
                p.getUrl(),
                dueno != null ? dueno.getFullName() : "Usuario",
                dueno != null ? baseUrl + "/api/user/photo/" + dueno.getId() : null,
                p.getFechaUpload() != null ? p.getFechaUpload().format(FECHA_FORMATO) : null,
                p.getVisibilidad() == Visibilidad.PUBLICA ? "publica" : "privada",
                p.getDescripcion(),
                photoLikeRepository.countByIdPhotoId(p.getId()),
                likedByMe,
                commentRepository.countByPhoto(p)
        );
        response.setGrupoId(p.getGrupoId());
        return response;
    }

    private CommentResponse desde(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getUsuario() != null ? c.getUsuario().getId() : null,
                c.getUsuario() != null ? c.getUsuario().getFullName() : "Anónimo",
                c.getTexto(),
                c.getFecha() != null ? c.getFecha().format(FECHA_FORMATO) : null,
                c.isEditado()
        );
    }

    private NotificationResponse desdeNotificacion(Notification n) {
        String nombre = n.getUsuarioOrigen() != null ? n.getUsuarioOrigen().getFullName() : "Alguien";
        String mensaje = "comentario".equals(n.getTipo())
                ? nombre + " comentó tu foto"
                : nombre + " le dio me gusta a tu foto";
        return new NotificationResponse(
                n.getId(),
                n.getTipo(),
                nombre,
                mensaje,
                n.getFecha() != null ? n.getFecha().format(FECHA_FORMATO) : null,
                n.isLeida()
        );
    }
}
