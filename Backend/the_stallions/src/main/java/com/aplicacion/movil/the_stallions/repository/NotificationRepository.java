package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Notification;
import com.aplicacion.movil.the_stallions.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUsuarioDestinoOrderByFechaDesc(User usuarioDestino);

    Optional<Notification> findByIdAndUsuarioDestino(Long id, User usuarioDestino);
}
