package com.aplicacion.movil.the_stallions.model;

/**
 * Roles del sistema (RBAC).
 *
 * <p>Definen qué puede hacer cada usuario dentro de la API:</p>
 * <ul>
 *   <li>{@code USER}    - operaciones normales de la app (fotos, perfil, eventos, emprender).</li>
 *   <li>{@code ADMIN}   - gestión completa: asignar roles, suspender usuarios y ver la bitácora.</li>
 *   <li>{@code AUDITOR} - acceso de solo lectura a la administración (listar usuarios y bitácora).</li>
 * </ul>
 */
public enum Rol {
    USER,
    ADMIN,
    AUDITOR;

    /**
     * Resuelve un rol por su nombre ignorando mayúsculas/minúsculas.
     *
     * @param nombre valor que llega desde la petición (ej: "admin", "AUDITOR")
     * @return el rol correspondiente
     * @throws IllegalArgumentException si el valor no es un rol válido
     */
    public static Rol fromName(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El rol no puede estar vacío");
        }
        try {
            return valueOf(nombre.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rol no válido. Use USER, ADMIN o AUDITOR");
        }
    }
}