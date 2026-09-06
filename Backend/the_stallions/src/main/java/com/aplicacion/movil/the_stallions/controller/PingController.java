package com.aplicacion.movil.the_stallions.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint público liviano para health-checks externos (UptimeRobot, etc.).
 * No consulta la base de datos y responde también a HEAD, de modo que un
 * monitor externo puede mantener el servicio despierto en Render sin gastar
 * una query a SQL Server por cada ping.
 */
@RestController
@RequestMapping("/api/ping")
public class PingController {

    @GetMapping
    public Map<String, String> ping() {
        return Map.of("status", "ok", "service", "wani-connect-api");
    }
}