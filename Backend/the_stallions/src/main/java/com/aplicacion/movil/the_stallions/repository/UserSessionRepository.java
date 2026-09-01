package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByTokenId(String tokenId);
    List<UserSession> findByUserIdAndActiveTrueOrderByLastActiveDesc(Long userId);
    void deleteByUserId(Long userId);

    @Modifying
    @Query("update UserSession s set s.active = false where s.user.id = :userId")
    void deactivateAllByUserId(@Param("userId") Long userId);
}
