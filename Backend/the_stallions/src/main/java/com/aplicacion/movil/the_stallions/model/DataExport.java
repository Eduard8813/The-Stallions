package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DataExports")
public class DataExport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @Column(name = "ExportId", unique = true, nullable = false, length = 64)
    private String exportId;

    @Column(name = "Status", nullable = false, length = 20)
    private String status = "processing";

    @Column(name = "AvailableForHours", nullable = false)
    private int availableForHours = 48;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getExportId() {
        return exportId;
    }

    public void setExportId(String exportId) {
        this.exportId = exportId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAvailableForHours() {
        return availableForHours;
    }

    public void setAvailableForHours(int availableForHours) {
        this.availableForHours = availableForHours;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
