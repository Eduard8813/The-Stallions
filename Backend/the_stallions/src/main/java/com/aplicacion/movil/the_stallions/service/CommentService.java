package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Response.CommentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private FotoService fotoService;

    public List<CommentResponse> obtenerComentarios(Long fotoId) {
        return fotoService.obtenerComentarios(fotoId);
    }

    public CommentResponse agregarComentario(Long fotoId, String texto) {
        return fotoService.agregarComentario(fotoId, texto, fotoService.usuarioActual());
    }

    public CommentResponse editarComentario(Long comentarioId, String nuevoTexto) {
        return fotoService.editarComentario(comentarioId, nuevoTexto, fotoService.usuarioActual());
    }

    public void eliminarComentario(Long comentarioId) {
        fotoService.eliminarComentario(comentarioId, fotoService.usuarioActual());
    }
}
