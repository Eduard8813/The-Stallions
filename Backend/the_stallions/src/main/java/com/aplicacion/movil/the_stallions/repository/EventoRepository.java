package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByCategoriaOrderByFechaAsc(CategoriaEvento categoria);

    List<Evento> findAllByOrderByFechaAsc();

    List<Evento> findByFechaBetweenOrderByFechaAsc(LocalDate inicio, LocalDate fin);
}
