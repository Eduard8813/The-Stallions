package com.aplicacion.movil.the_stallions.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Envío de notificaciones push vía Firebase Cloud Messaging.
 *
 * IMPORTANTE: usa las credenciales ya cargadas por FirebaseConfig
 * (firebase-credentials.json o la variable de entorno FIREBASE_CREDENTIALS_JSON).
 * No se configuró nada nuevo; si el proyecto Firebase no tiene Cloud Messaging
 * habilitado, los envíos fallarán y quedará registrado en el log.
 */
@Service
public class FcmService {

    private static final Logger log = LoggerFactory.getLogger(FcmService.class);

    /**
     * Envía una notificación a un tema (topic) de FCM.
     * Los clientes se suscriben al tema para recibirla.
     */
    public void enviarATopic(String topic, String titulo, String cuerpo) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(titulo)
                            .setBody(cuerpo)
                            .build())
                    .putData("type", "evento")
                    .build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("[FcmService] Notificación enviada al topic '{}': {}", topic, response);
        } catch (Exception e) {
            log.error("[FcmService] Error enviando notificación al topic '{}': {}", topic, e.getMessage());
        }
    }
}
