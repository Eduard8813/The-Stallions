package com.aplicacion.movil.the_stallions.repository;

import com.aplicacion.movil.the_stallions.model.DataExport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataExportRepository extends JpaRepository<DataExport, Long> {
    void deleteByUserId(Long userId);
}
