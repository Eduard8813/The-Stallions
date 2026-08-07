package com.aplicacion.movil.the_stallions.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envía el código de verificación 2FA por email cuando SMTP está configurado
 * (app.smtp.enabled=true). Si no está configurado, el código se registra en el
 * log del servidor para poder probar el flujo igualmente.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean smtpEnabled;
    private final String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${app.smtp.enabled:false}") boolean smtpEnabled,
                        @Value("${app.smtp.from:no-reply@the-stallions.com}") String from) {
        this.mailSenderProvider = mailSenderProvider;
        this.smtpEnabled = smtpEnabled;
        this.from = from;
    }

    public void sendVerificationCode(String to, String code) {
        if (!smtpEnabled) {
            log.info("[2FA] Código de verificación para {}: {}", to, code);
            return;
        }

        try {
            JavaMailSender sender = mailSenderProvider.getIfAvailable();
            if (sender == null) {
                log.info("[2FA] SMTP sin conexión, código para {}: {}", to, code);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Tu código de verificación — Wani Connect");
            message.setText("Tu código de verificación es: " + code
                    + "\n\nExpira en 5 minutos. Si no lo solicitaste, ignorá este mensaje.");
            sender.send(message);
            log.info("[2FA] Código enviado por email a {}", to);
        } catch (Exception e) {
            log.warn("[2FA] No se pudo enviar el email a {}: {}", to, e.getMessage());
            log.info("[2FA] Código de verificación para {}: {}", to, code);
        }
    }
}
