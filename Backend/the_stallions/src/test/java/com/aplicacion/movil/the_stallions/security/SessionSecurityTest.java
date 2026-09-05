package com.aplicacion.movil.the_stallions.security;

import com.aplicacion.movil.the_stallions.model.Rol;
import com.aplicacion.movil.the_stallions.model.User;
import com.aplicacion.movil.the_stallions.model.UserSession;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SessionSecurityTest {

    @Test
    void sesionActivaRecienteNoEstaExpirada() {
        UserSession session = new UserSession();
        session.setActive(true);
        session.setLastActive(LocalDateTime.now().minusMinutes(5));

        assertFalse(session.isExpired(720), "Una sesión con 5 min de actividad no debe expirar");
    }

    @Test
    void sesionActivaInactivaMasDelLimiteEstaExpirada() {
        UserSession session = new UserSession();
        session.setActive(true);
        session.setLastActive(LocalDateTime.now().minusHours(24));

        assertTrue(session.isExpired(720), "24h sin actividad con límite de 720 min debe expirar");
    }

    @Test
    void sesionInactivaEstaSiempreExpirada() {
        UserSession session = new UserSession();
        session.setActive(false);
        session.setLastActive(LocalDateTime.now());

        assertTrue(session.isExpired(720), "Una sesión desactivada siempre se considera expirada");
    }

    @Test
    void rolSeResuelveIgnorandoMayusculas() {
        assertEquals(Rol.ADMIN, Rol.fromName("admin"));
        assertEquals(Rol.AUDITOR, Rol.fromName(" Auditor "));
        assertEquals(Rol.USER, Rol.fromName("user"));
    }

    @Test
    void rolInvalidoLanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> Rol.fromName("superuser"));
        assertThrows(IllegalArgumentException.class, () -> Rol.fromName(""));
    }

    @Test
    void usuarioNuevoTieneRolUserPorDefecto() {
        User user = new User();
        assertEquals(Rol.USER, user.getRol());
    }
}