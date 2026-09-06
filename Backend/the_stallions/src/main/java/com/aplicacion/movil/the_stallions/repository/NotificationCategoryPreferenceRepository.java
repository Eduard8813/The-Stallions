package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.NotificationCategoryPreference;
import com.aplicacion.movil.the_stallions.model.NotificationCategoryPreferenceId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationCategoryPreferenceRepository
        extends JpaRepository<NotificationCategoryPreference, NotificationCategoryPreferenceId> {

    List<NotificationCategoryPreference> findByIdUserId(Long userId);

    void deleteByIdUserId(Long userId);
}