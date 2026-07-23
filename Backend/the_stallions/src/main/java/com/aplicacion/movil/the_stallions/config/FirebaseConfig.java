package com.aplicacion.movil.the_stallions.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;
                String credentialsJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
                if (credentialsJson != null && !credentialsJson.isBlank()) {
                    serviceAccount = new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
                } else {
                    serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-credentials.json");
                    if (serviceAccount == null) {
                        throw new IOException("firebase-credentials.json no encontrado en classpath ni en variable de entorno FIREBASE_CREDENTIALS_JSON");
                    }
                }
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
            }
        } catch (IOException e) {
            throw new RuntimeException("[FirebaseConfig] No se pudo inicializar Firebase: " + e.getMessage(), e);
        }
    }
}