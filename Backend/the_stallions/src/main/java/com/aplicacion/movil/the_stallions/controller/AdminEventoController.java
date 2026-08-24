package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.EventoRequest;
import com.aplicacion.movil.the_stallions.model.CategoriaEvento;
import com.aplicacion.movil.the_stallions.model.Evento;
import com.aplicacion.movil.the_stallions.service.EventoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequestMapping("/admin/eventos")
public class AdminEventoController {

    private final EventoService eventoService;

    public AdminEventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("eventos", eventoService.listar(null));
        return "admin/eventos";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("evento", new EventoRequest());
        model.addAttribute("categorias", CategoriaEvento.values());
        return "admin/evento-form";
    }

    @PostMapping
    public String guardar(@Valid @ModelAttribute("evento") EventoRequest request,
                          BindingResult result,
                          @RequestParam(value = "foto", required = false) MultipartFile foto,
                          HttpServletRequest httpRequest,
                          Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categorias", CategoriaEvento.values());
            return "admin/evento-form";
        }
        var creado = eventoService.crear(request);
        if (foto != null && !foto.isEmpty()) {
            eventoService.actualizarFoto(creado.getId(), foto, httpRequest);
        }
        return "redirect:/admin/eventos?creado";
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        Evento evento = eventoService.buscarEntidad(id);
        EventoRequest request = new EventoRequest();
        request.setTitulo(evento.getTitulo());
        request.setFecha(evento.getFecha());
        request.setFechaFin(evento.getFechaFin());
        request.setCategoria(evento.getCategoria());
        request.setDescripcion(evento.getDescripcion());
        model.addAttribute("evento", request);
        model.addAttribute("categorias", CategoriaEvento.values());
        model.addAttribute("idEvento", evento.getId());
        model.addAttribute("fotoActual", evento.getFotoUrl());
        return "admin/evento-form";
    }

    @PostMapping("/{id}")
    public String actualizar(@PathVariable Long id,
                             @Valid @ModelAttribute("evento") EventoRequest request,
                             BindingResult result,
                             @RequestParam(value = "foto", required = false) MultipartFile foto,
                             HttpServletRequest httpRequest,
                             Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categorias", CategoriaEvento.values());
            model.addAttribute("idEvento", id);
            return "admin/evento-form";
        }
        eventoService.actualizar(id, request);
        if (foto != null && !foto.isEmpty()) {
            eventoService.actualizarFoto(id, foto, httpRequest);
        }
        return "redirect:/admin/eventos?actualizado";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id) {
        eventoService.eliminar(id);
        return "redirect:/admin/eventos?eliminado";
    }
}
