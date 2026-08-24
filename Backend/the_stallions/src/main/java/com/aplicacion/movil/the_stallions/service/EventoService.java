package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.EventoRequest;
import com.aplicacion.movil.the_stallions.dto.Response.EventoResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;
import com.aplicacion.movil.the_stallions.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventoService {

    private static final long MAX_FOTO_BYTES = 10L * 1024 * 1024;

    private final EventoRepository eventoRepository;

    @Value("${app.base-url:}")
    private String baseUrlOverride;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> listar(CategoriaEvento categoria) {
        List<Evento> eventos = (categoria != null)
                ? eventoRepository.findByCategoriaOrderByFechaAsc(categoria)
                : eventoRepository.findAllByOrderByFechaAsc();
        return eventos.stream().map(EventoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public EventoResponse obtener(Long id) {
        return new EventoResponse(buscarEntidad(id));
    }

    @Transactional
    public EventoResponse crear(EventoRequest request) {
        Evento evento = new Evento();
        aplicar(evento, request);
        return new EventoResponse(eventoRepository.save(evento));
    }

    @Transactional
    public EventoResponse actualizar(Long id, EventoRequest request) {
        Evento evento = buscarEntidad(id);
        aplicar(evento, request);
        evento.setUpdatedAt(java.time.LocalDateTime.now());
        return new EventoResponse(eventoRepository.save(evento));
    }

    @Transactional
    public void eliminar(Long id) {
        Evento evento = buscarEntidad(id);
        eventoRepository.delete(evento);
    }

    /**
     * Sube o reemplaza la foto del evento (multipart). Devuelve el evento actualizado.
     */
    @Transactional
    public EventoResponse actualizarFoto(Long id, MultipartFile foto, HttpServletRequest httpRequest) {
        if (foto == null || foto.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar una imagen");
        }
        if (foto.getContentType() == null || !foto.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }
        if (foto.getSize() > MAX_FOTO_BYTES) {
            throw new IllegalArgumentException("La imagen no puede superar los 10 MB");
        }

        try {
            Evento evento = buscarEntidad(id);
            evento.setFotoData(foto.getBytes());
            evento.setFotoContentType(foto.getContentType());
            evento.setFotoUrl(buildFotoUrl(httpRequest, evento.getId(), System.currentTimeMillis()));
            evento.setUpdatedAt(LocalDateTime.now());
            return new EventoResponse(eventoRepository.save(evento));
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer la imagen seleccionada");
        }
    }

    @Transactional(readOnly = true)
    public FotoEvento getFoto(Long id) {
        Evento evento = buscarEntidad(id);
        if (evento.getFotoData() == null) {
            throw new NotFoundException("El evento no tiene foto");
        }
        return new FotoEvento(evento.getFotoData(), evento.getFotoContentType());
    }

    private String buildFotoUrl(HttpServletRequest request, Long eventoId, long version) {
        String baseUrl = (baseUrlOverride != null && !baseUrlOverride.isBlank())
                ? baseUrlOverride
                : request.getRequestURL().toString().replace(request.getRequestURI(), "");
        return baseUrl + request.getContextPath() + "/api/eventos/" + eventoId + "/foto?v=" + version;
    }

    public record FotoEvento(byte[] bytes, String contentType) {}

    @Transactional(readOnly = true)
    public List<Evento> findProximosEntre(LocalDate inicio, LocalDate fin) {
        return eventoRepository.findByFechaBetweenOrderByFechaAsc(inicio, fin);
    }

    @Transactional(readOnly = true)
    public Evento buscarEntidad(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
    }

    private void aplicar(Evento evento, EventoRequest request) {
        evento.setTitulo(request.getTitulo().trim());
        evento.setFecha(request.getFecha());
        evento.setFechaFin(request.getFechaFin());
        evento.setCategoria(request.getCategoria());
        evento.setDescripcion(request.getDescripcion().trim());
    }
}
