package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.EmprendimientoRequest;
import com.aplicacion.movil.the_stallions.dto.Response.EmprendimientoResponse;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.Emprendimiento;
import com.aplicacion.movil.the_stallions.repository.EmprendimientoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmprendimientoService {

    private static final long MAX_FOTO_BYTES = 10L * 1024 * 1024;

    public static final List<String> CATEGORIAS = List.of("Gastronomia", "Agroindustria", "Artesania");

    private final EmprendimientoRepository emprendimientoRepository;

    @Value("${app.base-url:}")
    private String baseUrlOverride;

    public EmprendimientoService(EmprendimientoRepository emprendimientoRepository) {
        this.emprendimientoRepository = emprendimientoRepository;
    }

    @Transactional(readOnly = true)
    public List<EmprendimientoResponse> listar(String tipo) {
        List<Emprendimiento> lista;
        if (tipo != null && !tipo.isBlank()) {
            lista = emprendimientoRepository.findByTipoOrderByNombreAsc(tipo.trim());
        } else {
            lista = emprendimientoRepository.findAllByOrderByNombreAsc();
        }
        return lista.stream()
                .map(EmprendimientoResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias() {
        return CATEGORIAS;
    }

    @Transactional(readOnly = true)
    public EmprendimientoResponse obtener(Long id) {
        return new EmprendimientoResponse(buscarEntidad(id));
    }

    @Transactional
    public EmprendimientoResponse crear(EmprendimientoRequest request) {
        Emprendimiento e = new Emprendimiento();
        aplicar(e, request);
        return new EmprendimientoResponse(emprendimientoRepository.save(e));
    }

    @Transactional
    public EmprendimientoResponse actualizar(Long id, EmprendimientoRequest request) {
        Emprendimiento e = buscarEntidad(id);
        aplicar(e, request);
        e.setUpdatedAt(LocalDateTime.now());
        return new EmprendimientoResponse(emprendimientoRepository.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        emprendimientoRepository.delete(buscarEntidad(id));
    }

    @Transactional
    public EmprendimientoResponse actualizarFoto(Long id, MultipartFile foto, HttpServletRequest httpRequest) {
        if (foto == null || foto.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar una imagen");
        }
        if (foto.getContentType() == null || !foto.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }
        if (foto.getSize() > MAX_FOTO_BYTES) {
            throw new IllegalArgumentException("La imagen no puede superar los 10 MB");
        }
        try {
            Emprendimiento e = buscarEntidad(id);
            e.setFotoData(foto.getBytes());
            e.setFotoContentType(foto.getContentType());
            e.setFotoUrl(buildFotoUrl(httpRequest, e.getId(), System.currentTimeMillis()));
            e.setUpdatedAt(LocalDateTime.now());
            return new EmprendimientoResponse(emprendimientoRepository.save(e));
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer la imagen seleccionada");
        }
    }

    @Transactional(readOnly = true)
    public FotoEmprendimiento getFoto(Long id) {
        Emprendimiento e = buscarEntidad(id);
        if (e.getFotoData() == null) {
            throw new NotFoundException("El emprendimiento no tiene foto");
        }
        return new FotoEmprendimiento(e.getFotoData(), e.getFotoContentType());
    }

    @Transactional(readOnly = true)
    public Emprendimiento buscarEntidad(Long id) {
        return emprendimientoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Emprendimiento no encontrado"));
    }

    private void aplicar(Emprendimiento e, EmprendimientoRequest request) {
        e.setNombre(request.getNombre().trim());
        e.setTipo(normalizarTipo(request.getTipo()));
        e.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        e.setLat(request.getLat());
        e.setLng(request.getLng());
        e.setContactoTelefono(request.getContactoTelefono());
        e.setContactoEmail(request.getContactoEmail());
        e.setContactoRedes(request.getContactoRedes());
    }

    /**
     * Normaliza el tipo de un emprendimiento a una de las 3 categorias validas
     * (Gastronomia, Agroindustria, Artesania), tolerando acentos y diferencias
     * de mayusculas/minusculas.
     */
    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return CATEGORIAS.get(0);
        }
        String t = tipo.trim();
        for (String categoria : CATEGORIAS) {
            if (eliminarAcentos(t).equalsIgnoreCase(categoria.toLowerCase())) {
                return categoria;
            }
        }
        return t;
    }

    private String eliminarAcentos(String s) {
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    private String buildFotoUrl(HttpServletRequest request, Long id, long version) {
        String baseUrl = (baseUrlOverride != null && !baseUrlOverride.isBlank())
                ? baseUrlOverride
                : request.getRequestURL().toString().replace(request.getRequestURI(), "");
        return baseUrl + request.getContextPath() + "/api/emprendimientos/" + id + "/foto?v=" + version;
    }

    public record FotoEmprendimiento(byte[] bytes, String contentType) {}
}
