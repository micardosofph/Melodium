package com.melodium.backend;

import com.melodium.backend.model.Usuario;
import com.melodium.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UsuarioControllerIntegrationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @BeforeEach
    void limparBanco() {
        usuarioRepository.deleteAll();
    }

    @Test
    void criaListaEAtualizaOfensivaSemExporSenha() throws Exception {
        HttpResponse<String> cadastro = post("/usuarios", """
            {"nome":"Visitante da Feira","email":"visitante@melodium.test","senha_hash":"segredo"}
            """);

        assertThat(cadastro.statusCode()).isEqualTo(200);
        assertThat(cadastro.body()).contains("Visitante da Feira", "visitante@melodium.test");
        assertThat(cadastro.body()).doesNotContain("senha_hash", "segredo");

        Usuario salvo = usuarioRepository.findByEmail("visitante@melodium.test").orElseThrow();
        HttpResponse<String> primeiraPratica = post("/usuarios/" + salvo.getId_usuario() + "/ofensiva", "");
        HttpResponse<String> praticaRepetida = post("/usuarios/" + salvo.getId_usuario() + "/ofensiva", "");

        assertThat(primeiraPratica.statusCode()).isEqualTo(200);
        assertThat(praticaRepetida.statusCode()).isEqualTo(200);
        assertThat(usuarioRepository.findById(salvo.getId_usuario()).orElseThrow().getOfensiva()).isEqualTo(1);

        HttpResponse<String> listagem = get("/usuarios");
        assertThat(listagem.statusCode()).isEqualTo(200);
        assertThat(listagem.body()).contains("Visitante da Feira", "\"ofensiva\":1");
        assertThat(listagem.body()).doesNotContain("senha_hash", "segredo");
    }

    @Test
    void rejeitaEmailDuplicado() throws Exception {
        String perfil = """
            {"nome":"Perfil Repetido","email":"repetido@melodium.test","senha_hash":"123"}
            """;

        assertThat(post("/usuarios", perfil).statusCode()).isEqualTo(200);
        HttpResponse<String> duplicado = post("/usuarios", perfil);

        assertThat(duplicado.statusCode()).isEqualTo(400);
        assertThat(usuarioRepository.count()).isEqualTo(1);
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl() + path)).GET().build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(String path, String json) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl() + path))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String baseUrl() {
        return "http://127.0.0.1:" + port;
    }
}
