package com.aplicacion.movil.the_stallions.dto.Response;

import com.aplicacion.movil.the_stallions.model.Emprendimiento;

public class EmprendimientoResponse {

    private Long id;
    private String nombre;
    private String tipo;
    private String descripcion;
    private Double lat;
    private Double lng;
    private String contactoTelefono;
    private String contactoEmail;
    private String contactoRedes;
    private String fotoUrl;

    public EmprendimientoResponse() {
    }

    public EmprendimientoResponse(Emprendimiento e) {
        this.id = e.getId();
        this.nombre = e.getNombre();
        this.tipo = e.getTipo();
        this.descripcion = e.getDescripcion();
        this.lat = e.getLat();
        this.lng = e.getLng();
        this.contactoTelefono = e.getContactoTelefono();
        this.contactoEmail = e.getContactoEmail();
        this.contactoRedes = e.getContactoRedes();
        this.fotoUrl = e.getFotoUrl();
    }

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

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }
}
