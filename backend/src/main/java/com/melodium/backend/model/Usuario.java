package com.melodium.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "USUARIOS")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_usuario;

    private String nome;
    private String email;
    private String senha_hash;

    // Relação (1, 1) com GAMIFICACAO
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Gamificacao gamificacao;

    // Relação (1, N) com TAREFAS
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Tarefa> tarefas;

    // Relação (1, N) com POSTAGENS
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Postagem> postagens;

}