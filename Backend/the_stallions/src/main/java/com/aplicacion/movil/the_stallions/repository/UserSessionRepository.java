package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByTokenId(String tokenId);
    List<UserSession> findByUserIdAndActiveTrueOrderByLastActiveDesc(Long userId);
    void deleteByUserId(Long userId);
}
