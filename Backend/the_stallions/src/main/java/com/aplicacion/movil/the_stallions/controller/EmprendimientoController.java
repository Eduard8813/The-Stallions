package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.EmprendimientoRequest;
import com.aplicacion.movil.the_stallions.dto.Response.EmprendimientoResponse;
import com.aplicacion.movil.the_stallions.service.EmprendimientoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/emprendimientos")
public class EmprendimientoController {

    private final EmprendimientoService emprendimientoService;

    public EmprendimientoController(EmprendimientoService emprendimientoService) {
        this.emprendimientoService = emprendimientoService;
    }

    @GetMapping
    public ResponseEntity<List<EmprendimientoResponse>> listar() {
        return ResponseEntity.ok(emprendimientoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmprendimientoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(emprendimientoService.obtener(id));
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long id) {
        EmprendimientoService.FotoEmprendimiento foto = emprendimientoService.getFoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.contentType() != null ? foto.contentType() : "image/jpeg"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(foto.bytes());
    }

    @PostMapping
    public ResponseEntity<EmprendimientoResponse> crear(@Valid @RequestBody EmprendimientoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprendimientoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmprendimientoResponse> actualizar(@PathVariable Long id,
                                                             @Valid @RequestBody EmprendimientoRequest request) {
        return ResponseEntity.ok(emprendimientoService.actualizar(id, request));
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<EmprendimientoResponse> subirFoto(@PathVariable Long id,
                                                            @RequestParam("foto") MultipartFile foto,
                                                            HttpServletRequest request) {
        return ResponseEntity.ok(emprendimientoService.actualizarFoto(id, foto, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        emprendimientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
