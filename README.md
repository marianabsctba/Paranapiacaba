# Paranapiacaba: Escola de Bruxaria Cibernética

Jogo gratuito para o navegador que ensina segurança cibernética do zero, em sete anos letivos numa escola de bruxaria escondida na neblina da serra de Paranapiacaba (SP).

**Jogar:** https://marianabsctba.github.io/Paranapiacaba/

Funciona no celular e no computador. Sem cadastro, sem anúncio, sem paywall (a energia é infinita, a Diretora vetou). O progresso fica salvo no seu navegador e pode ser exportado como código para continuar em outro aparelho.

## O que tem

- **Sete anos letivos**, um mistério por ano, do primeiro `ls` até resposta a incidente completa.
- **Aulas com três estrelas**: explicação didática no quadro e exercícios variados (terminal de verdade simulado, múltipla escolha, ligar colunas, ordenar etapas, completar lacuna, achar a linha suspeita no log).
- **Feitiços são comandos reais.** Depois de aprendidos, viram ferramenta para explorar as salas do castelo e revelar segredos.
- **Duelos** de rodadas rápidas com tempo.
- **Casas** (Onçarina, Tucanal, Capivárias e Jararacas), escolhidas pelo Capacete Classificador, e a Taça das Casas no fim de cada ano.
- **Evolução da personagem**: nível, título, atributos (sistemas, redes, cripto, web, defesa, forense, ofensiva ética, engenharia social), uniforme que ganha uma faixa por ano.
- **Coleções**: grimório, bestiário de criaturas-malware (com a defesa de verdade), álbum de figurinhas de pioneiros reais da computação, malão e dormitório.
- **Amizades** que mudam com as suas escolhas.

Enredo e personagens são originais. Toda técnica ofensiva aparece só em laboratório autorizado e sempre junto da defesa.

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm test
```

- `BIBLIA.md`: regras de escrita, mundo, elenco e arco dos sete anos.
- `src/conteudo/tipos.ts`: contrato do conteúdo. Cada ano vive em `src/conteudo/anoN.ts`.
- `tests/conteudo.test.ts`: valida todo o conteúdo (ids, falas, exercícios, regex do terminal, ausência de travessão). Para validar um ano só: `ANO=3 npx vitest run`.
- `src/motor`: estado salvo, texto e progressão. `src/ui`: telas, palco da história, exercícios. `src/arte`: retratos e cenários em SVG gerados no código.

A cada push na `main`, o GitHub Actions roda os testes e publica no GitHub Pages.
