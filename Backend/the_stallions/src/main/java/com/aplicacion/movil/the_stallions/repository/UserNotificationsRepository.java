package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.UserNotifications;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNotificationsRepository extends JpaRepository<UserNotifications, Long> {
    Optional<UserNotifications> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
