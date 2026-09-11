package com.melodium.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "GAMIFICACAO")
public class Gamificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_perfil;

    private Integer xp_total;
    private Integer streak_atual;
    private Integer nivel_atual;

    @OneToOne
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario")
    private Usuario usuario;

    public Long getId_perfil() { return id_perfil; }
    public void setId_perfil(Long id_perfil) { this.id_perfil = id_perfil; }
    public Integer getXp_total() { return xp_total; }
    public void setXp_total(Integer xp_total) { this.xp_total = xp_total; }
    public Integer getStreak_atual() { return streak_atual; }
    public void setStreak_atual(Integer streak_atual) { this.streak_atual = streak_atual; }
    public Integer getNivel_atual() { return nivel_atual; }
    public void setNivel_atual(Integer nivel_atual) { this.nivel_atual = nivel_atual; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}