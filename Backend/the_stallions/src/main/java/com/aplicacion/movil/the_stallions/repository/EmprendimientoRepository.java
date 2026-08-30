package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Emprendimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmprendimientoRepository extends JpaRepository<Emprendimiento, Long> {

    List<Emprendimiento> findAllByOrderByNombreAsc();

    List<Emprendimiento> findByTipoOrderByNombreAsc(String tipo);
}
