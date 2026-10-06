package com.melodium.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_usuario;

    private String nome;
    private String email;
    private String senha_hash;

    private Integer ofensiva = 0;
    private LocalDate ultimaAtividade;

    public Usuario() {
    }

    public Usuario(String nome, String email, String senha_hash) {
        this.nome = nome;
        this.email = email;
        this.senha_hash = senha_hash;
        this.ofensiva = 0;
    }

    public Long getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(Long id_usuario) {
        this.id_usuario = id_usuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha_hash() {
        return senha_hash;
    }

    public void setSenha_hash(String senha_hash) {
        this.senha_hash = senha_hash;
    }

    public Integer getOfensiva() {
        return ofensiva != null ? ofensiva : 0;
    }

    public void setOfensiva(Integer ofensiva) {
        this.ofensiva = ofensiva;
    }

    public LocalDate getUltimaAtividade() {
        return ultimaAtividade;
    }

    public void setUltimaAtividade(LocalDate ultimaAtividade) {
        this.ultimaAtividade = ultimaAtividade;
    }
}