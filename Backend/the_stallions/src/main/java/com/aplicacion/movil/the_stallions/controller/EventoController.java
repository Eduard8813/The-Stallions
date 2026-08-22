package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Response.EventoResponse;
import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;
import com.aplicacion.movil.the_stallions.service.EventoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.BASIC_ISO_DATE;

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public ResponseEntity<List<EventoResponse>> listar(
            @RequestParam(required = false) CategoriaEvento categoria) {
        return ResponseEntity.ok(eventoService.listar(categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.obtener(id));
    }

    @GetMapping(value = "/{id}/ics", produces = "text/calendar;charset=UTF-8")
    public ResponseEntity<String> descargarIcs(@PathVariable Long id) {
        Evento evento = eventoService.buscarEntidad(id);
        String ics = construirIcs(evento);
        String nombreArchivo = "evento-" + evento.getId() + ".ics";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"")
                .contentType(MediaType.parseMediaType("text/calendar;charset=UTF-8"))
                .body(ics);
    }

    private String construirIcs(Evento evento) {
        LocalDate fecha = evento.getFecha();
        String fechaIcs = fecha.format(ICS_DATE);
        return String.join("\r\n",
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//The Stallions//Eventos//ES",
                "CALSCALE:GREGORIAN",
                "BEGIN:VEVENT",
                "UID:evento-" + evento.getId() + "@the-stallions",
                "DTSTAMP:" + LocalDate.now().format(ICS_DATE) + "T000000Z",
                "DTSTART;VALUE=DATE:" + fechaIcs,
                "DTEND;VALUE=DATE:" + fecha.plusDays(1).format(ICS_DATE),
                "SUMMARY:" + escaparIcs(evento.getTitulo()),
                "DESCRIPTION:" + escaparIcs(evento.getDescripcion()),
                "CATEGORIES:" + evento.getCategoria().name(),
                "END:VEVENT",
                "END:VCALENDAR"
        );
    }

    private String escaparIcs(String valor) {
        return valor.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n");
    }
}
