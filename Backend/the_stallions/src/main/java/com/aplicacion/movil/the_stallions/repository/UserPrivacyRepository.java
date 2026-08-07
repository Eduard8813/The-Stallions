package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.UserPrivacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPrivacyRepository extends JpaRepository<UserPrivacy, Long> {
    Optional<UserPrivacy> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
