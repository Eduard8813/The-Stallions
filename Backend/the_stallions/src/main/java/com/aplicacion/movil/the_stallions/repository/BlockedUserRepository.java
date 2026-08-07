package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {
    List<BlockedUser> findByUserId(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
}
