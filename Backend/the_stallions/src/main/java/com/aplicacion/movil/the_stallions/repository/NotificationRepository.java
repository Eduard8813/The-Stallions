package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.Notification;
import com.aplicacion.movil.the_stallions.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUsuarioDestinoOrderByFechaDesc(User usuarioDestino);

    @Query("SELECT n FROM Notification n WHERE n.usuarioDestino.id = :usuarioId AND n.leida = false ORDER BY n.fecha DESC")
    List<Notification> findNoLeidasPorUsuario(@Param("usuarioId") Long usuarioId);
}