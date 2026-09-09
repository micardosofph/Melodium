package br.com.melodium.api.controller;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TestControllerTest {

    @Test
    void shouldReturnHealthMessage() {
        TestController controller = new TestController();

        assertEquals("A API do Melodium está no ar com sucesso!", controller.healthCheck());
    }
}
