package com.melodium.backend.repository;

import com.melodium.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // ADICIONADO

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método mágico do Spring que busca o usuário no banco pelo e-mail
    Optional<Usuario> findByEmail(String email);
}