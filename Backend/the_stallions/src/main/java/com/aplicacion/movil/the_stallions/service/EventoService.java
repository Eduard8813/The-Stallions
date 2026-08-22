package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.EventoRequest;
import com.aplicacion.movil.the_stallions.dto.Response.EventoResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;
import com.aplicacion.movil.the_stallions.repository.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

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
        evento.setCategoria(request.getCategoria());
        evento.setDescripcion(request.getDescripcion().trim());
    }
}
