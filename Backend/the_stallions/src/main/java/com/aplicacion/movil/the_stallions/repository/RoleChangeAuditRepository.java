package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.RoleChangeAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleChangeAuditRepository extends JpaRepository<RoleChangeAudit, Long> {

    List<RoleChangeAudit> findTop200ByOrderByCreatedAtDesc();
}