package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.AssignRoleRequest;
import com.aplicacion.movil.the_stallions.dto.Request.UpdateUserStatusRequest;
import com.aplicacion.movil.the_stallions.dto.Response.RoleChangeAuditResponse;
import com.aplicacion.movil.the_stallions.dto.Response.UserAdminResponse;
import com.aplicacion.movil.the_stallions.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST de administración (RBAC).
 *
 * <ul>
 *   <li>{@code GET} en {@code /api/admin/**}: acceso {@code ADMIN} y {@code AUDITOR}.</li>
 *   <li>Escrituras (asignar rol, suspender): solo {@code ADMIN}.</li>
 * </ul>
 * La doble verificación (ruta en {@code SecurityConfig} + {@code @PreAuthorize})
 * garantiza que ningún rol fuera de los permitidos alcance estos endpoints.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

    private final AdminService adminService;

    public AdminApiController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<List<UserAdminResponse>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminResponse> assignRole(@PathVariable Long id,
                                                        @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(adminService.assignRole(id, request.getRole()));
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminResponse> updateStatus(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateStatus(id, request.getEnabled()));
    }

    @GetMapping("/roles/audit")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<List<RoleChangeAuditResponse>> getAuditLog() {
        return ResponseEntity.ok(adminService.getAuditLog());
    }
}