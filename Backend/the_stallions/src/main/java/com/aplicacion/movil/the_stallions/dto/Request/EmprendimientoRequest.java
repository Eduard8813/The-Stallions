package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EmprendimientoRequest {

    @NotBlank(message = "El nombre del negocio es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    private String nombre;

    @NotBlank(message = "El tipo de emprendimiento es obligatorio")
    @Size(max = 60, message = "El tipo no puede superar 60 caracteres")
    private String tipo;

    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    private String descripcion;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90")
    @DecimalMax(value = "90")
    private Double lat;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180")
    @DecimalMax(value = "180")
    private Double lng;

    @Size(max = 40, message = "El teléfono no puede superar 40 caracteres")
    private String contactoTelefono;

    @Size(max = 120, message = "El email no puede superar 120 caracteres")
    private String contactoEmail;

    @Size(max = 300, message = "El contacto de redes no puede superar 300 caracteres")
    private String contactoRedes;

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
}
