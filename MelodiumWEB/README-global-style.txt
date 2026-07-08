Checklist de migração para style global

1) Incluir o global/style.css em cada página HTML:
   <link rel="stylesheet" href="../global/style.css">

2) Depois, ir removendo do style.css local o que for repetido (variáveis, reset, body e navbar base).

3) Para páginas com navbar fixa no topo (landing), garantir que o header tenha a classe adicional:
   <header class="navbar ... fixed-top">  (ou ajustar conforme seu HTML)

