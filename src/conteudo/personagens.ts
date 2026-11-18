import type { Personagem, Lugar } from './tipos';

// Personagens fixos, usados em vários anos. Anos podem acrescentar outros no próprio arquivo.
export const PERSONAGENS_BASE: Personagem[] = [
  { id: 'narrador', nome: 'Narração', papel: 'narração', cor: '#b9a7d9', pele: '#000', cabelo: '#000', estilo: 'capuz', roupa: '#000' },
  { id: 'voce', nome: '{nome}', papel: 'você', cor: '#ffd166', pele: '#c68642', cabelo: '#2b1a10', estilo: 'cacheado', roupa: '#333' },

  // família
  { id: 'vo_cida', nome: 'Vó Cida', papel: 'avó que criou você em Nova Iguaçu, imprime e-mail para ler', cor: '#e39ec1', pele: '#8d5524', cabelo: '#e8e8e8', estilo: 'coque', oculos: true, roupa: '#a35d7a' },

  // amigos
  { id: 'tati', nome: 'Tati Okamoto', papel: 'amiga da Liberdade (SP), faz planilha até do próprio aniversário', cor: '#9b8cff', pele: '#f1d6c0', cabelo: '#111', estilo: 'longo', oculos: true, roupa: '#4b3f8f' },
  { id: 'caua', nome: 'Cauã Ferreira', papel: 'amigo de Belém, conserta tudo com fita isolante e fé', cor: '#ff7b54', pele: '#8d5524', cabelo: '#111', estilo: 'cacheado', roupa: '#7a3b2e' },
  { id: 'bia', nome: 'Bia Kruger', papel: 'catarinense de Blumenau, goleira de Capturebol, sincera demais', cor: '#ffb347', pele: '#f6e0d0', cabelo: '#e3c16f', estilo: 'coque', roupa: '#a0522d' },
  { id: 'jonas', nome: 'Jonas Bezerra', papel: 'colega de Caruaru, poeta de cordel e de commit message', cor: '#8ecae6', pele: '#c68642', cabelo: '#2b1a10', estilo: 'curto', roupa: '#33658a' },

  // rival
  { id: 'enzo', nome: 'Enzo Valentim', papel: 'rival, filho de influencer de cripto, tem três notebooks e nenhum backup', cor: '#c0c0c0', pele: '#f6e0d0', cabelo: '#6b4f3a', estilo: 'curto', roupa: '#1f4d3a' },

  // escola
  { id: 'iolanda', nome: 'Diretora Iolanda Sertã', papel: 'diretora, ex-hacker da era do modem discado, responde tudo com um provérbio adulterado', cor: '#e9d8a6', pele: '#8d5524', cabelo: '#e8e8e8', estilo: 'cacheado', oculos: true, roupa: '#5b2a86' },
  { id: 'otavio', nome: 'Prof. Otávio Quintela', papel: 'Feitiços de Terminal, fala baixo, odeia mouse', cor: '#90e0ef', pele: '#f1c27d', cabelo: '#ddd', estilo: 'careca', oculos: true, roupa: '#1d3557' },
  { id: 'ruth', nome: 'Profa. Ruth Amaral', papel: 'Encantamento de Redes, ex-técnica de telefonia, carrega um alicate de crimpar no bolso', cor: '#94d2bd', pele: '#e0ac69', cabelo: '#444', estilo: 'coque', roupa: '#0b6e4f' },
  { id: 'heitor', nome: 'Prof. Heitor Lisboa', papel: 'Criptografia, elegante, sarcástico, nunca repete uma senha nem um elogio', cor: '#adb5bd', pele: '#e8d3c0', cabelo: '#111', estilo: 'barba', roupa: '#111111' },
  { id: 'nanda', nome: 'Profa. Nanda Siqueira', papel: 'Defesa e Vigilância (Blue Team), toma café em balde, já viu de tudo num plantão', cor: '#b5e48c', pele: '#c68642', cabelo: '#3a5a40', estilo: 'cacheado', roupa: '#606c38' },
  { id: 'baltazar', nome: 'Baltazar', papel: 'tratador das criaturas-malware, ex-pescador de Ubatuba, fala com vírus como quem fala com cachorro', cor: '#d4a373', pele: '#8d5524', cabelo: '#3b2a1a', estilo: 'barba', roupa: '#5c4033' },
  { id: 'zuleica', nome: 'Zuleica', papel: 'bibliotecária, tem um índice invertido no lugar do coração', cor: '#cdb4db', pele: '#f1d6c0', cabelo: '#6d597a', estilo: 'coque', oculos: true, roupa: '#6d597a' },
  { id: 'vila_lurdinha', nome: 'Dona Lurdinha', papel: 'doceira da vila, dona da Doceria Byte Doce', cor: '#ff9fd2', pele: '#c68642', cabelo: '#333', estilo: 'coque', roupa: '#c2185b' },
  { id: 'vila_kenji', nome: 'Seu Kenji', papel: 'dono da loja de teclados e cabos da vila', cor: '#6ef2ff', pele: '#f1d6c0', cabelo: '#222', estilo: 'curto', roupa: '#37474f' },
  { id: 'vila_firmina', nome: 'Dona Firmina', papel: 'livreira da vila, lê RFC no café da manhã', cor: '#e8c66a', pele: '#8d5524', cabelo: '#aaa', estilo: 'coque', roupa: '#6d4c41' },
  { id: 'vila_oswaldo', nome: 'Seu Oswaldo', papel: 'carteiro do correio de pombos da vila', cor: '#b8ff9f', pele: '#e0ac69', cabelo: '#777', estilo: 'careca', roupa: '#1b5e20' },
  { id: 'vila_juca', nome: 'Juca', papel: 'dono da loja de pegadinhas, ensina a reconhecer golpe', cor: '#ff6ec7', pele: '#c68642', cabelo: '#111', estilo: 'cacheado', roupa: '#4a148c' },
  { id: 'seu_ze', nome: 'Seu Zé do Rack', papel: 'zelador do data center do castelo, conhece cada cabo pelo nome', cor: '#a68a64', pele: '#e0ac69', cabelo: '#777', estilo: 'careca', roupa: '#583e23' },
  { id: 'bitu', nome: 'Bitu', papel: 'gato preto do castelo que pisa no teclado e já derrubou produção duas vezes', cor: '#ffd6a5', pele: '#222', cabelo: '#222', estilo: 'bicho', roupa: '#222' },
  { id: 'chapeu', nome: 'Capacete Classificador', papel: 'capacete de obra com um modelo de ML de 1997, enviesado e orgulhoso disso', cor: '#f4d35e', pele: '#f4d35e', cabelo: '#f4d35e', estilo: 'bicho', roupa: '#f4d35e' },

  // lado sombrio
  { id: 'nulo', nome: 'O Nulo', papel: 'vilão; ex-aluno brilhante que sumiu da internet e voltou como ameaça', cor: '#9d0208', pele: '#dfe7e2', cabelo: '#111', estilo: 'capuz', roupa: '#0b090a' },
  { id: 'marlene', nome: 'Marlene Cabral', papel: 'braço direito do Nulo, ex-diretora de TI que vende acesso inicial', cor: '#e5383b', pele: '#e8d3c0', cabelo: '#9c2c2c', estilo: 'longo', roupa: '#161a1d' },

  // adultos de fora
  { id: 'deputado', nome: 'Secretário Válter Prado', papel: 'Secretário de Bruxaria Digital, especialista em nota oficial que não diz nada', cor: '#bc6c25', pele: '#f1c27d', cabelo: '#888', estilo: 'careca', roupa: '#283618' },
];

// Lugares fixos. Anos podem acrescentar outros.
export const LUGARES_BASE: Lugar[] = [
  { id: 'casa_vo', nome: 'Casa da Vó Cida, Nova Iguaçu', descricao: 'Casa com portão que abre com qualquer controle e um roteador que só funciona de cabeça para baixo.', ano: 1, cena: 'casa' },
  { id: 'santa_ifigenia', nome: 'Galeria Oculta da Santa Ifigênia', descricao: 'Andar escondido de uma galeria no centro de São Paulo, onde bruxos compram cabo, teclado encantado e componente sem nota.', ano: 1, cena: 'cidade' },
  { id: 'estacao', nome: 'Estação de Paranapiacaba', descricao: 'A estação antiga da serra. Quem tem convite enxerga a linha que sobe para o castelo.', ano: 1, cena: 'trem' },
  { id: 'patio', nome: 'Pátio de Neblina', descricao: 'Entrada do castelo. A neblina aqui é tão densa que já derrubou o sinal de três operadoras.', ano: 1, cena: 'castelo' },
  { id: 'refeitorio', nome: 'Refeitório Grande', descricao: 'Mesas compridas, teto que mostra o céu e o status do servidor. Café coado o dia inteiro.', ano: 1, cena: 'castelo' },
  { id: 'dormitorio', nome: 'Dormitório da Casa', descricao: 'Beliches, uma tomada para vinte pessoas e um Wi-Fi com nome ofensivo que ninguém assume.', ano: 1, cena: 'sala' },
  { id: 'lab_terminal', nome: 'Laboratório de Terminal', descricao: 'Bancadas com terminais verdes e cheiro de café requentado.', ano: 1, cena: 'sala' },
  { id: 'cripta', nome: 'Cripta de Criptografia', descricao: 'Porão frio com cofres antigos. Cada um abre com uma cifra diferente.', ano: 1, cena: 'masmorra' },
  { id: 'torre_redes', nome: 'Torre das Antenas', descricao: 'A torre mais alta, cheia de antenas, pombos e um switch que zumbe como colmeia.', ano: 1, cena: 'torre' },
  { id: 'datacenter', nome: 'Data Center do Castelo', descricao: 'Corredor frio de racks piscando. Seu Zé do Rack proíbe comida, mas esconde paçoca atrás do nobreak.', ano: 1, cena: 'sala' },
  { id: 'biblioteca', nome: 'Biblioteca', descricao: 'Estantes até o teto e uma ala trancada com manuais que só se lê com autorização.', ano: 1, cena: 'sala' },
  { id: 'viveiro', nome: 'Viveiro do Baltazar', descricao: 'Galpão na beira da mata, cheio de gaiolas de contenção com criaturas-malware.', ano: 1, cena: 'casa' },
  { id: 'mata', nome: 'Mata Isolada', descricao: 'Mata atlântica dentro de uma rede segmentada. O que nasce lá dentro, fica lá dentro.', ano: 1, cena: 'floresta' },
  { id: 'campo', nome: 'Campo de Capturebol', descricao: 'Arquibancadas de madeira, aros altos e a Flag Dourada zunindo na neblina.', ano: 1, cena: 'campo' },
  { id: 'sala_diretora', nome: 'Sala da Diretora', descricao: 'Cheia de modems antigos, um quadro de cortiça com post-its de 1998 e uma cafeteira que fala.', ano: 1, cena: 'torre' },
  { id: 'represa', nome: 'Represa do Castelo', descricao: 'Água escura ao pé da serra. O cabo submarino do castelo passa no fundo.', ano: 1, cena: 'lago' },
  { id: 'vila', nome: 'Vila de Paranapiacaba', descricao: 'Casinhas de madeira, neblina e uma padaria que vende pão de queijo com Wi-Fi.', ano: 2, cena: 'cidade' },
  { id: 'vila_vagao', nome: 'Vagão do Seu Zé', descricao: 'Um vagão antigo virado bar. O quentão de caramelo salgado sai quente e deixa bigode de espuma.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'vila_doceria', nome: 'Doceria Byte Doce', descricao: 'Doces que mudam de cor conforme o ping. O brigadeiro de 64 bits é o mais pedido.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'vila_teclados', nome: 'Teclados & Cabos da Serra', descricao: 'Teclados que acendem quando gostam de você e cabos que ninguém sabe para que servem.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'vila_livraria', nome: 'Livraria do Protocolo', descricao: 'RFCs encadernadas em couro. O vendedor recita a RFC 2324 de cor.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'vila_correio', nome: 'Correio de Pombos', descricao: 'Pombos-correio com criptografia de ponta a ponta. O atraso é de fábrica.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'vila_pegadinhas', nome: 'Pegadinhas de Rede Ltda', descricao: 'Loja de pegadinhas. Tudo aqui parece golpe, e metade é mesmo: serve de aula.', ano: 2, cena: 'cidade', dentro: 'vila' },
  { id: 'secretaria', nome: 'Secretaria de Bruxaria Digital', descricao: 'Em Brasília, atrás de um orelhão desativado. Tudo tem protocolo e ninguém lê.', ano: 3, cena: 'ministerio' },
];
