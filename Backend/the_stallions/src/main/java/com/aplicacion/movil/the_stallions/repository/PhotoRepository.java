package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Photo;
import com.aplicacion.movil.the_stallions.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByUserIdAndVisibilidad(String userId, Visibilidad visibilidad);

    List<Photo> findByVisibilidad(Visibilidad visibilidad);

    @Query("SELECT p FROM Photo p WHERE p.visibilidad = :visibilidad ORDER BY p.fechaUpload DESC")
    List<Photo> findPublicas(@Param("visibilidad") Visibilidad visibilidad);
}