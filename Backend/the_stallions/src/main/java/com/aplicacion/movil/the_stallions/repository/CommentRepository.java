package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Comment;
import com.aplicacion.movil.the_stallions.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPhotoOrderByFechaAsc(Photo photo);

    long countByPhoto(Photo photo);
}
