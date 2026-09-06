package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.NotificationChannelPreference;
import com.aplicacion.movil.the_stallions.model.NotificationChannelPreferenceId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationChannelPreferenceRepository
        extends JpaRepository<NotificationChannelPreference, NotificationChannelPreferenceId> {

    List<NotificationChannelPreference> findByIdUserId(Long userId);

    void deleteByIdUserId(Long userId);
}