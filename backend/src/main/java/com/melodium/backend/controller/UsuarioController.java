package com.melodium.backend.controller;

import com.melodium.backend.model.Usuario;
import com.melodium.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> realizarLogin(@RequestBody Usuario usuarioLogin) {
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmail(usuarioLogin.getEmail());

        if (usuarioEncontrado.isPresent()) {
            Usuario usuario = usuarioEncontrado.get();
            if (usuario.getSenha_hash().equals(usuarioLogin.getSenha_hash())) {
                return ResponseEntity.ok(usuario);
            }
        }

        return ResponseEntity.status(401).body("E-mail ou senha inválidos!");
    }

    @PostMapping("/{id}/ofensiva")
    public ResponseEntity<?> praticarHoje(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioOpt.get();
        LocalDate hoje = LocalDate.now();
        LocalDate ultima = usuario.getUltimaAtividade();

        if (ultima == null) {
            usuario.setOfensiva(1);
            usuario.setUltimaAtividade(hoje);
        } else if (ultima.equals(hoje)) {
            return ResponseEntity.ok(usuario);
        } else if (ultima.equals(hoje.minusDays(1))) {
            usuario.setOfensiva(usuario.getOfensiva() + 1);
            usuario.setUltimaAtividade(hoje);
        } else {
            usuario.setOfensiva(1);
            usuario.setUltimaAtividade(hoje);
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(usuarioAtualizado);
    }
}