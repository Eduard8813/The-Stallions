package com.aplicacion.movil.the_stallions.scheduler;

import com.aplicacion.movil.the_stallions.model.UserSession;
import com.aplicacion.movil.the_stallions.repository.UserSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Expira de forma programada las sesiones inactivas.
 *
 * <p>El filtro JWT ya rechaza peticiones con sesiones vencidas; este
 * componente además las marca como {@code inactivas} en la BD una vez por
 * hora para mantener el estado consistente y acotar las sesiones activas.</p>
 */
@Component
public class SessionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(SessionCleanupScheduler.class);

    private final UserSessionRepository userSessionRepository;

    @Value("${app.session.max-inactivity-minutes:720}")
    private long maxInactivityMinutes;

    public SessionCleanupScheduler(UserSessionRepository userSessionRepository) {
        this.userSessionRepository = userSessionRepository;
    }

    /**
     * Se ejecuta cada hora en el minuto 5.
     */
    @Scheduled(cron = "0 5 * * * *")
    public void expireInactiveSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(maxInactivityMinutes);
        List<UserSession> vencidas = userSessionRepository.findByActiveTrueAndLastActiveBefore(cutoff);

        for (UserSession session : vencidas) {
            session.setActive(false);
            userSessionRepository.save(session);
        }

        if (!vencidas.isEmpty()) {
            log.info("Sesiones vencidas por inactividad y desactivadas: {}", vencidas.size());
        }
    }
}