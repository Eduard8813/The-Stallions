package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.PhotoLike;
import com.aplicacion.movil.the_stallions.model.PhotoLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoLikeRepository extends JpaRepository<PhotoLike, PhotoLikeId> {

    long countByIdPhotoId(Long photoId);

    boolean existsByIdPhotoIdAndIdUserId(Long photoId, Long userId);

    void deleteByIdPhotoId(Long photoId);
}