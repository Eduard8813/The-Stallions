package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class AssignRoleRequest {

    @NotBlank(message = "El rol no puede estar vacío")
    private String role;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}