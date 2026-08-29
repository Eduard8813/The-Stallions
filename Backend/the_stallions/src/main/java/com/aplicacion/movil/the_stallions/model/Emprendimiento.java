package com.aplicacion.movil.the_stallions.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Emprendimientos")
public class Emprendimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    /** Tipo / rubro del emprendimiento (artesanía, gastronomía, etc.). */
    @Column(nullable = false, length = 60)
    private String tipo;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    @Column(name = "ContactoTelefono", length = 40)
    private String contactoTelefono;

    @Column(name = "ContactoEmail", length = 120)
    private String contactoEmail;

    @Column(name = "ContactoRedes", length = 300)
    private String contactoRedes;

    @Column(name = "FotoData", columnDefinition = "varbinary(max)")
    private byte[] fotoData;

    @Column(name = "FotoContentType", length = 100)
    private String fotoContentType;

    @Column(name = "FotoUrl", length = 500)
    private String fotoUrl;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }

    public String getContactoTelefono() {
        return contactoTelefono;
    }

    public void setContactoTelefono(String contactoTelefono) {
        this.contactoTelefono = contactoTelefono;
    }

    public String getContactoEmail() {
        return contactoEmail;
    }

    public void setContactoEmail(String contactoEmail) {
        this.contactoEmail = contactoEmail;
    }

    public String getContactoRedes() {
        return contactoRedes;
    }

    public void setContactoRedes(String contactoRedes) {
        this.contactoRedes = contactoRedes;
    }

    public byte[] getFotoData() {
        return fotoData;
    }

    public void setFotoData(byte[] fotoData) {
        this.fotoData = fotoData;
    }

    public String getFotoContentType() {
        return fotoContentType;
    }

    public void setFotoContentType(String fotoContentType) {
        this.fotoContentType = fotoContentType;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
