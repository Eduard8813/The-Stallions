package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.EmprendimientoRequest;
import com.aplicacion.movil.the_stallions.model.Emprendimiento;
import com.aplicacion.movil.the_stallions.service.EmprendimientoService;
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
@RequestMapping("/admin/emprendimientos")
public class AdminEmprendimientoController {

    private final EmprendimientoService emprendimientoService;

    public AdminEmprendimientoController(EmprendimientoService emprendimientoService) {
        this.emprendimientoService = emprendimientoService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("emprendimientos", emprendimientoService.listar());
        return "admin/emprendimientos";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("emprendimiento", new EmprendimientoRequest());
        return "admin/emprendimiento-form";
    }

    @PostMapping
    public String guardar(@Valid @ModelAttribute("emprendimiento") EmprendimientoRequest request,
                          BindingResult result,
                          @RequestParam(value = "foto", required = false) MultipartFile foto,
                          HttpServletRequest httpRequest,
                          Model model) {
        if (result.hasErrors()) {
            return "admin/emprendimiento-form";
        }
        var creado = emprendimientoService.crear(request);
        if (foto != null && !foto.isEmpty()) {
            emprendimientoService.actualizarFoto(creado.getId(), foto, httpRequest);
        }
        return "redirect:/admin/emprendimientos?creado";
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        Emprendimiento e = emprendimientoService.buscarEntidad(id);
        EmprendimientoRequest request = new EmprendimientoRequest();
        request.setNombre(e.getNombre());
        request.setTipo(e.getTipo());
        request.setDescripcion(e.getDescripcion());
        request.setLat(e.getLat());
        request.setLng(e.getLng());
        request.setContactoTelefono(e.getContactoTelefono());
        request.setContactoEmail(e.getContactoEmail());
        request.setContactoRedes(e.getContactoRedes());
        model.addAttribute("emprendimiento", request);
        model.addAttribute("idEmprendimiento", e.getId());
        model.addAttribute("fotoActual", e.getFotoUrl());
        return "admin/emprendimiento-form";
    }

    @PostMapping("/{id}")
    public String actualizar(@PathVariable Long id,
                             @Valid @ModelAttribute("emprendimiento") EmprendimientoRequest request,
                             BindingResult result,
                             @RequestParam(value = "foto", required = false) MultipartFile foto,
                             HttpServletRequest httpRequest,
                             Model model) {
        if (result.hasErrors()) {
            model.addAttribute("idEmprendimiento", id);
            return "admin/emprendimiento-form";
        }
        emprendimientoService.actualizar(id, request);
        if (foto != null && !foto.isEmpty()) {
            emprendimientoService.actualizarFoto(id, foto, httpRequest);
        }
        return "redirect:/admin/emprendimientos?actualizado";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id) {
        emprendimientoService.eliminar(id);
        return "redirect:/admin/emprendimientos?eliminado";
    }
}
