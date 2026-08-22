package com.aplicacion.movil.the_stallions.scheduler;

import com.aplicacion.movil.the_stallions.model.Evento;
import com.aplicacion.movil.the_stallions.service.EventoService;
import com.aplicacion.movil.the_stallions.service.FcmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Revisión diaria de eventos próximos (entre 24 y 48 horas a futuro)
 * para preparar el envío de notificaciones push vía FCM.
 */
@Component
public class EventoNotificacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(EventoNotificacionScheduler.class);
    private static final String TOPIC_EVENTOS = "eventos";
    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", new Locale("es"));

    private final EventoService eventoService;
    private final FcmService fcmService;

    public EventoNotificacionScheduler(EventoService eventoService, FcmService fcmService) {
        this.eventoService = eventoService;
        this.fcmService = fcmService;
    }

    /**
     * Corre todos los días a las 8:00 (hora del servidor).
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void notificarEventosProximos() {
        LocalDate manana = LocalDate.now().plusDays(1);
        LocalDate pasadoManana = LocalDate.now().plusDays(2);

        List<Evento> proximos = eventoService.findProximosEntre(manana, pasadoManana);
        if (proximos.isEmpty()) {
            log.info("[EventoNotificacionScheduler] No hay eventos próximos en las próximas 24-48hs.");
            return;
        }

        for (Evento evento : proximos) {
            String fechaLegible = evento.getFecha().format(FORMATO_FECHA);
            fcmService.enviarATopic(
                    TOPIC_EVENTOS,
                    evento.getTitulo(),
                    "Recuerda: este evento es " + fechaLegible + "."
            );
        }
    }
}
