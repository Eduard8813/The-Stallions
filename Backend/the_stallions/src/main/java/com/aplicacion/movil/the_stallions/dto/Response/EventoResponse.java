package com.aplicacion.movil.the_stallions.dto.Response;

import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;

import java.time.LocalDate;

public class EventoResponse {

    private Long id;
    private String titulo;
    private LocalDate fecha;
    private CategoriaEvento categoria;
    private String descripcion;

    public EventoResponse() {
    }

    public EventoResponse(Evento evento) {
        this.id = evento.getId();
        this.titulo = evento.getTitulo();
        this.fecha = evento.getFecha();
        this.categoria = evento.getCategoria();
        this.descripcion = evento.getDescripcion();
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public CategoriaEvento getCategoria() {
        return categoria;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
