// Contrato do conteúdo do jogo. Todo ano (anoN.ts) exporta um objeto Ano.
// Identificadores em ASCII, sem acento. Texto para quem joga com acento.
//
// Marcação aceita dentro de qualquer texto exibido:
//   {nome}        nome que a pessoa escolheu
//   {casa}        nome da casa da pessoa (ex.: Onçarina)
//   {o/a/e}       flexão de gênero: primeira forma para ele, segunda para ela, terceira para elu
//                 (vale para qualquer trio: {lindo/linda/linde}, {o aluno/a aluna/ume alune})
//   `codigo`      trecho monoespaçado
//   **negrito**   destaque

export type Atributo =
  | 'sistemas' // computador, SO, terminal, arquivos, permissões
  | 'redes' // IP, portas, protocolos, DNS
  | 'cripto' // hash, cifra, chaves, certificados
  | 'web' // HTTP, OWASP, aplicações
  | 'defesa' // SOC, SIEM, detecção, hardening
  | 'forense' // logs, linha do tempo, memória, evidência
  | 'ofensiva' // pentest ético, exploração em laboratório
  | 'social'; // engenharia social, phishing, fator humano

export type CasaId = 'oncarina' | 'tucanal' | 'capivarias' | 'jararacas';

// Quem fala. Ids dos personagens base estão em personagens.ts.
// Use 'narrador' para narração e 'voce' para falas da pessoa que joga.
export type Quem = string;

export type Fala = [Quem, string];

// ---------- Exercícios ----------

export interface ExMultipla {
  tipo: 'multipla';
  pergunta: string;
  opcoes: string[]; // de 2 a 5
  correta: number; // índice em opcoes
  explicacao: string; // aparece depois de responder (certo ou errado)
}

export interface ExTerminal {
  tipo: 'terminal';
  enunciado: string;
  prompt?: string; // ex.: 'aluno@paranapiacaba:~$' (padrão)
  contexto?: string; // saída já visível no terminal antes de digitar (opcional)
  aceitos: string[]; // expressões regulares (fonte, sem barras) testadas contra o comando normalizado
  // normalização: trim e espaços múltiplos viram um espaço. O teste é ^(?:regex)$, sem diferenciar maiúscula
  exemplo: string; // resposta canônica; TEM que casar com algum item de aceitos
  saida: string; // o que o terminal mostra quando acerta (várias linhas com \n)
  dica: string;
  explicacao: string;
}

export interface ExLigar {
  tipo: 'ligar';
  enunciado: string;
  pares: [string, string][]; // de 3 a 6 pares; a coluna da direita é embaralhada
  explicacao: string;
}

export interface ExOrdenar {
  tipo: 'ordenar';
  enunciado: string;
  itens: string[]; // na ordem CORRETA; o jogo embaralha (de 3 a 7 itens)
  explicacao: string;
}

export interface ExLacuna {
  tipo: 'lacuna';
  enunciado: string; // contém exatamente um ___ (três sublinhados)
  aceitos: string[]; // respostas aceitas, comparadas sem maiúscula e sem espaços nas pontas
  explicacao: string;
}

export interface ExAchar {
  tipo: 'achar';
  enunciado: string; // ex.: 'Toque nas linhas do log que indicam força bruta'
  linhas: string[]; // log, pacote, e-mail, código... uma linha por item
  corretas: number[]; // índices das linhas que devem ser marcadas (pelo menos 1)
  explicacao: string;
}

export type Exercicio = ExMultipla | ExTerminal | ExLigar | ExOrdenar | ExLacuna | ExAchar;

// ---------- Passos de um capítulo ----------

export type LugarId = string;

export interface PassoCena {
  tipo: 'cena';
  lugar: LugarId;
  falas: Fala[];
}

export interface PassoAula {
  tipo: 'aula';
  id: string; // único no jogo inteiro, ex.: 'a1_binario'
  materia: string; // ex.: 'Feitiços de Terminal'
  professor: Quem;
  titulo: string;
  atributo: Atributo;
  lugar: LugarId;
  abertura: Fala[]; // o professor abre a aula com humor (2 a 6 falas)
  explicacao: string[]; // parágrafos didáticos de verdade, do zero; pode usar `codigo` e **negrito**
  exercicios: Exercicio[]; // pelo menos 4, tipos variados
  feitico?: string; // id de feitiço aprendido ao concluir (ver Feitico)
}

export interface OpcaoEscolha {
  texto: string;
  efeito?: Efeito;
  resposta: Fala[]; // reação imediata
}

export interface PassoEscolha {
  tipo: 'escolha';
  lugar: LugarId;
  pergunta: string;
  opcoes: OpcaoEscolha[]; // 2 a 4
}

// Momento de tensão da história resolvido com um exercício (sem pular)
export interface PassoDesafio {
  tipo: 'desafio';
  lugar: LugarId;
  titulo: string;
  antes: Fala[];
  exercicio: Exercicio;
  depois: Fala[];
  atributo: Atributo;
}

// Duelo de feitiços (estilo jogo de escola de magia de celular): rodadas rápidas com tempo.
// Cada rodada é um exercício curto (de preferência 'multipla', 'lacuna' ou 'terminal').
// Acertar tira vida do oponente; errar tira a sua. O motor cuida de vida, tempo e animação.
export interface PassoDuelo {
  tipo: 'duelo';
  lugar: LugarId;
  oponente: Quem;
  titulo: string; // ex.: 'Duelo no Clube de Duelos: você contra Enzo'
  antes: Fala[];
  rodadas: Exercicio[]; // de 3 a 6
  vitoria: Fala[];
  derrota: Fala[]; // perder não trava a história, só muda a reação
  atributo: Atributo;
}

// Libera coisas e mostra um aviso bonito
export interface PassoRecompensa {
  tipo: 'recompensa';
  texto: string;
  efeito: Efeito;
}

// O Boné Classificador. O motor faz as perguntas e define a casa.
export interface PassoSelecao {
  tipo: 'selecao';
}

// Fim de ano: Taça das Casas, boletim, festa. O motor calcula.
/** partida jogável de Capturebol dentro da história (não tem derrota: a história segue) */
export interface PassoCapturebol {
  tipo: 'capturebol';
  lugar: string;
  rival: string; // nome do time adversário no placar
  corRival: string; // '#rrggbb'
  // 'flag-aparece': a partida para quando a Flag surge (a cena seguinte conta a captura)
  // 'flag-pega': você joga até pegar a Flag
  termina: 'flag-aparece' | 'flag-pega';
}

export interface PassoFimDeAno {
  tipo: 'fimDeAno';
}

export type Passo =
  | PassoCena
  | PassoAula
  | PassoEscolha
  | PassoDesafio
  | PassoDuelo
  | PassoRecompensa
  | PassoSelecao
  | PassoFimDeAno
  | PassoCapturebol;

export interface Efeito {
  xp?: number;
  pontosCasa?: number; // pode ser negativo
  atributos?: Partial<Record<Atributo, number>>;
  amizade?: Record<string, number>; // id do personagem -> delta
  flag?: string; // marca que fica salva
  criatura?: string; // libera no bestiário
  figurinha?: string; // libera no álbum
  feitico?: string; // ensina feitiço
  item?: string; // entra no malão
  lugar?: string; // libera no mapa do castelo
}

export interface Capitulo {
  id: string; // único, ex.: 'a1c01'
  titulo: string;
  mes: string; // 'Setembro', 'Outubro'...
  passos: Passo[];
}

// ---------- Coleções ----------

export interface Feitico {
  id: string;
  nome: string; // nome mágico, ex.: 'Listarium'
  comando: string; // comando real, ex.: 'ls -la'
  descricao: string; // o que faz de verdade, com humor
}

export interface Criatura {
  id: string;
  nome: string; // ex.: 'Basilisco dos Encanamentos'
  real: string; // o que é no mundo real, ex.: 'Worm que se espalha por SMB (porta 445)'
  perigo: 1 | 2 | 3 | 4 | 5;
  descricao: string;
  defesa: string; // como se defende de verdade
}

export interface Figurinha {
  id: string;
  nome: string; // pessoa real histórica ou marco da computação/segurança
  ano: string; // ex.: '1843'
  texto: string; // fato verdadeiro e verificável, com uma piada leve
}

export interface Item {
  id: string;
  nome: string;
  descricao: string;
}

// Objeto escondido numa sala do castelo, revelado digitando um feitiço já aprendido
export interface Segredo {
  feitico: string; // id do feitiço que revela
  texto: string; // o que aparece
  efeito?: Efeito;
}

export interface Lugar {
  id: string;
  nome: string;
  descricao: string;
  ano: number; // a partir de qual ano aparece no mapa (se não for liberado antes por efeito)
  cena: 'castelo' | 'sala' | 'masmorra' | 'floresta' | 'cidade' | 'casa' | 'trem' | 'campo' | 'torre' | 'lago' | 'banco' | 'ministerio';
  segredos?: Segredo[];
  // fica dentro de outro lugar (loja da vila): não aparece no mapa, entra-se pela porta
  dentro?: string;
}

export interface Personagem {
  id: string;
  nome: string;
  papel: string;
  cor: string; // cor do nome na caixa de fala
  // aparência para o avatar em SVG
  pele: string;
  cabelo: string;
  estilo: 'curto' | 'longo' | 'careca' | 'coque' | 'cacheado' | 'barba' | 'capuz' | 'bicho';
  oculos?: boolean;
  roupa: string;
}

export interface Ano {
  numero: number;
  titulo: string;
  resumo: string; // duas ou três frases para a tela de seleção
  capitulos: Capitulo[];
  // coleções que este ano introduz (ids únicos no jogo inteiro)
  feiticos: Feitico[];
  criaturas: Criatura[];
  figurinhas: Figurinha[];
  itens: Item[];
  lugares: Lugar[];
  personagens: Personagem[]; // personagens novos deste ano (os fixos ficam em personagens.ts)
}
