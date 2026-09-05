package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Response.RoleChangeAuditResponse;
import com.aplicacion.movil.the_stallions.dto.Response.UserAdminResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.Rol;
import com.aplicacion.movil.the_stallions.model.RoleChangeAudit;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.repository.RoleChangeAuditRepository;
import com.aplicacion.movil.the_stallions.repository.UserRepository;
import com.aplicacion.movil.the_stallions.repository.UserSessionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Administración de usuarios y roles (RBAC) de la API.
 *
 * <p>Permite al rol {@code ADMIN} asignar roles ({@code USER}/{@code ADMIN}/
 * {@code AUDITOR}) y suspender cuentas, y al rol {@code AUDITOR} consultar la
 * lista de usuarios y la bitácora de cambios de rol (solo lectura).</p>
 */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleChangeAuditRepository roleChangeAuditRepository;
    private final UserSessionRepository userSessionRepository;

    public AdminService(UserRepository userRepository, RoleChangeAuditRepository roleChangeAuditRepository,
                        UserSessionRepository userSessionRepository) {
        this.userRepository = userRepository;
        this.roleChangeAuditRepository = roleChangeAuditRepository;
        this.userSessionRepository = userSessionRepository;
    }

    public List<UserAdminResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserAdminResponse)
                .sorted((a, b) -> a.getEmail().compareToIgnoreCase(b.getEmail()))
                .toList();
    }

    @Transactional
    public UserAdminResponse assignRole(Long userId, String roleName) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Rol nuevoRol = Rol.fromName(roleName);
        User admin = currentUser();

        if (admin.getId().equals(target.getId())) {
            throw new IllegalArgumentException("No puedes cambiarte el rol a ti mismo");
        }

        Rol rolAnterior = target.getRol();
        if (rolAnterior == nuevoRol) {
            throw new IllegalArgumentException("El usuario ya tiene asignado el rol " + nuevoRol.name());
        }

        target.setRol(nuevoRol);
        target.setUpdatedAt(LocalDateTime.now());
        userRepository.save(target);

        logRoleChange(target, admin, rolAnterior, nuevoRol);
        return toUserAdminResponse(target);
    }

    @Transactional
    public UserAdminResponse updateStatus(Long userId, boolean enabled) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        User admin = currentUser();
        if (admin.getId().equals(target.getId())) {
            throw new IllegalArgumentException("No puedes suspender tu propia cuenta");
        }

        target.setEnabled(enabled);
        target.setUpdatedAt(LocalDateTime.now());
        userRepository.save(target);

        if (!enabled) {
            userSessionRepository.deactivateAllByUserId(userId);
        }
        return toUserAdminResponse(target);
    }

    public List<RoleChangeAuditResponse> getAuditLog() {
        return roleChangeAuditRepository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(entry -> {
                    RoleChangeAuditResponse response = new RoleChangeAuditResponse();
                    response.setUserId(String.valueOf(entry.getUser().getId()));
                    response.setUserEmail(entry.getUser().getEmail());
                    response.setChangedByEmail(entry.getChangedByEmail());
                    response.setFromRole(entry.getFromRole() != null ? entry.getFromRole().name() : null);
                    response.setToRole(entry.getToRole() != null ? entry.getToRole().name() : null);
                    response.setCreatedAt(entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : "");
                    return response;
                }).toList();
    }

    private void logRoleChange(User target, User changedBy, Rol fromRole, Rol toRole) {
        RoleChangeAudit entry = new RoleChangeAudit();
        entry.setUser(target);
        entry.setChangedById(changedBy.getId());
        entry.setChangedByEmail(changedBy.getEmail());
        entry.setFromRole(fromRole);
        entry.setToRole(toRole);
        roleChangeAuditRepository.save(entry);
    }

    private UserAdminResponse toUserAdminResponse(User user) {
        UserAdminResponse response = new UserAdminResponse();
        response.setId(String.valueOf(user.getId()));
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setUsername(user.getUsername());
        response.setRol(user.getRol().name());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return response;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String email)) {
            throw new IllegalArgumentException("No autenticado");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No autenticado"));
    }
}