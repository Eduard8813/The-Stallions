package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPhotoOrderByFechaDesc(Photo photo);

    @Query("SELECT c FROM Comment c WHERE c.photo.id = :fotoId ORDER BY c.fecha DESC")
    List<Comment> findByFotoIdOrderByFechaDesc(@Param("fotoId") Long fotoId);
}