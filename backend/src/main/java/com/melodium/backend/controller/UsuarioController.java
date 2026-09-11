package com.melodium.backend.controller;

import com.melodium.backend.model.Usuario;
import com.melodium.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*") // Permite que o seu frontend (React/Web) acesse a API sem problemas de CORS
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Rota para listar todos os usuários cadastrados
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    // Rota para cadastrar um novo usuário
    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}