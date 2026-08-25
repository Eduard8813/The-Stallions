package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.Visibilidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByUserIdOrderByFechaUploadDesc(Long userId);

    Page<Photo> findByVisibilidadOrderByFechaUploadDesc(Visibilidad visibilidad, Pageable pageable);
}
