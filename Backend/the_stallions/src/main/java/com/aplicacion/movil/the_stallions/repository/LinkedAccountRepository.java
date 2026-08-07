package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.LinkedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LinkedAccountRepository extends JpaRepository<LinkedAccount, Long> {
    List<LinkedAccount> findByUserId(Long userId);
    Optional<LinkedAccount> findByUserIdAndProvider(Long userId, String provider);
    void deleteByUserIdAndProvider(Long userId, String provider);
    void deleteByUserId(Long userId);
}
