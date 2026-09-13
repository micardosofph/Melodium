package com.melodium.backend.controller;

import com.melodium.backend.model.Usuario;
import com.melodium.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                return ResponseEntity.ok(usuario); // 200 OK (Login aprovado!)
            }
        }

        // Se e-mail não existir ou senha estiver errada:
        return ResponseEntity.status(401).body("E-mail ou senha inválidos!");
    }
}