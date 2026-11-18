import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

// Coleções do Ano 4: O Torneio das Bandeiras (web do zero, com laboratório autorizado)

export const personagensAno4: Personagem[] = [
  {
    id: 'a4_lia',
    nome: 'Lia Amaral',
    papel: 'estudante do Colégio Pampa Digital, de Pelotas, toma chimarrão de garrafa térmica e lê cabeçalho HTTP como quem lê bula',
    cor: '#7cc5db',
    pele: '#b77b55',
    cabelo: '#3a2018',
    estilo: 'coque',
    roupa: '#19465c',
  },
  {
    id: 'a4_davi',
    nome: 'Davi Nascimento',
    papel: 'mentor da Academia do Sertão, de Juazeiro, ex-desenvolvedor de sistema de prefeitura, responde tudo com um causo',
    cor: '#e0b45a',
    pele: '#8d5524',
    cabelo: '#25150d',
    estilo: 'curto',
    roupa: '#795c22',
  },
  {
    id: 'a4_gustavo',
    nome: 'Gustavo Ferraz',
    papel: 'mentor do Colégio Pampa Digital, de Pelotas, fala "bah" antes de todo alerta e nunca larga a cuia',
    cor: '#5fa8c4',
    pele: '#f1d6c0',
    cabelo: '#8a6a4a',
    estilo: 'barba',
    roupa: '#24506a',
  },
  {
    id: 'a4_caio',
    nome: 'Caio Benício',
    papel: 'estudante da Academia do Sertão, de Juazeiro, repentista, desafia o Jonas no verso e no SQL',
    cor: '#f0c674',
    pele: '#8d5524',
    cabelo: '#111',
    estilo: 'cacheado',
    roupa: '#8a5a1c',
  },
  {
    id: 'a4_iara',
    nome: 'Profa. Iara Quintanilha',
    papel: 'Artes da Web e Laboratório de Ataque Autorizado, ex-desenvolvedora de loja virtual que sobreviveu a nove Black Fridays',
    cor: '#ff79c6',
    pele: '#e0ac69',
    cabelo: '#2b1a10',
    estilo: 'longo',
    oculos: true,
    roupa: '#5a1846',
  },
  {
    id: 'a4_rubens',
    nome: 'Rubens Tavares',
    papel: 'técnico terceirizado de infraestrutura do torneio, contratado pela Secretaria, tem crachá de todo lugar e nenhum chamado aberto',
    cor: '#9aa5b1',
    pele: '#f1c27d',
    cabelo: '#555',
    estilo: 'careca',
    roupa: '#2f3e46',
  },
];

export const lugaresAno4: Lugar[] = [
  {
    id: 'a4_arena',
    nome: 'Arena das Bandeiras',
    descricao: 'O antigo galpão de cargas virou arena: palco, carteiras para três escolas, um placar enorme e as três bandeiras penduradas no teto de ferro.',
    ano: 4,
    cena: 'castelo',
    segredos: [
      {
        feitico: 'a4_cabecalhus',
        texto: 'Você pede só os cabeçalhos do servidor do placar. Um deles diz `X-Feito-Por: estagiario-2019`. A Profa. Iara anota: "cabeçalho que revela demais é convite para curioso".',
        efeito: { xp: 20, atributos: { web: 1 } },
      },
      {
        feitico: 'a4_hmac',
        texto: 'Embaixo do palco, um pen drive velho com o placar de 1998, quando o torneio era em disquete. Tem assinatura HMAC. Já em 1998 alguém desconfiava de placar.',
        efeito: { xp: 25, atributos: { cripto: 1 } },
      },
    ],
  },
  {
    id: 'a4_loja_lab',
    nome: 'Empório Fictício da Serra (loja de laboratório)',
    descricao: 'Bancadas isoladas com a loja falsa do torneio: vende pão de queijo de mentira, cobra em Bitcoronas de brinquedo e foi feita para ter falhas. Tudo aqui tem autorização por escrito colada na parede.',
    ano: 4,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a4_inspectio',
        texto: 'No código da página da loja há um comentário esquecido: `<!-- TODO: tirar a senha do admin daqui antes do torneio -->`. Sem senha nenhuma depois. A Profa. Iara colocou de isca, para ensinar a não deixar comentário no HTML.',
        efeito: { xp: 20, atributos: { web: 1 } },
      },
      {
        feitico: 'a4_politica',
        texto: 'A loja de laboratório responde sem Content-Security-Policy. Você registra no relatório e ganha um selo da organização: "achou ausência, que é a falha mais difícil de ver".',
        efeito: { xp: 25, atributos: { defesa: 1 } },
      },
      {
        feitico: 'a4_file',
        texto: 'Na pasta de uploads de teste há um arquivo `gatinho.jpg` que o `file` diz ser texto. É um bilhete do Bitu: "eu também sei mentir extensão".',
        efeito: { xp: 15, amizade: { bitu: 2 } },
      },
    ],
  },
  {
    id: 'a4_alojamento',
    nome: 'Alojamento das Escolas Visitantes',
    descricao: 'Dormitório improvisado na ala leste para quem veio de Pelotas e de Juazeiro. Tem rede de dormir, cuia de chimarrão no peitoral da janela e uma briga eterna sobre o volume do forró.',
    ano: 4,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a4_biscoitus',
        texto: 'O Caio guardou os cookies da sessão de treino num arquivo chamado `nao_mexa.txt`. Você não mexe, só avisa: cookie de sessão é segredo, mesmo de treino. Ele troca a senha e te dá um pedaço de rapadura.',
        efeito: { xp: 15, amizade: { a4_caio: 2 } },
      },
    ],
  },
  {
    id: 'a4_sala_arbitragem',
    nome: 'Sala da Arbitragem',
    descricao: 'Sala fechada atrás do palco com o servidor do placar, três monitores, o livro de ocorrências do torneio e uma cafeteira que a Nanda trouxe do SOC.',
    ano: 4,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a4_rastro',
        texto: 'Contando os códigos de status do log antigo do placar, você acha 4.012 respostas 404 numa madrugada de 2024. Era o Seu Zé procurando a página "como desligar o alarme".',
        efeito: { xp: 20, atributos: { forense: 1 }, amizade: { seu_ze: 1 } },
      },
      {
        feitico: 'a4_tls',
        texto: 'O certificado de teste do servidor da arbitragem venceu em 2021 e ninguém trocou porque "era só interno". Você anota. Interno também merece certificado válido.',
        efeito: { xp: 20, atributos: { cripto: 1 } },
      },
    ],
  },
];

export const feiticosAno4: Feitico[] = [
  {
    id: 'a4_cabecalhus',
    nome: 'Cabecalhus Revelio',
    comando: 'curl -I https://loja.torneio.lab',
    descricao: 'Pede ao servidor só a linha de status e os cabeçalhos da resposta (um HEAD). É olhar o rótulo da embalagem sem abrir o pacote.',
  },
  {
    id: 'a4_verbosus',
    nome: 'Verbosus Totalis',
    comando: 'curl -v https://loja.torneio.lab/',
    descricao: 'Mostra a conversa inteira: a requisição que saiu (com `>`), a resposta que voltou (com `<`) e até o aperto de mão do TLS. Fofoqueiro, mas fofoqueiro útil.',
  },
  {
    id: 'a4_inspectio',
    nome: 'Inspectio Paginae',
    comando: 'F12 (Ferramentas do desenvolvedor do navegador)',
    descricao: 'Abre as ferramentas do desenvolvedor: Elementos (HTML), Console (JavaScript), Rede (cada requisição) e Aplicação (cookies). Funciona em qualquer navegador e não invade nada: só mostra o que já chegou até você.',
  },
  {
    id: 'a4_tls',
    nome: 'Apertus Manuum',
    comando: 'openssl s_client -connect loja.torneio.lab:443 -servername loja.torneio.lab',
    descricao: 'Faz o aperto de mão TLS na mão e mostra o certificado, quem assinou, a validade e a versão do protocolo. Cadeado do navegador em modo raio X.',
  },
  {
    id: 'a4_biscoitus',
    nome: 'Biscoitus Custodia',
    comando: 'curl -c cookies.txt -b cookies.txt https://loja.torneio.lab/login',
    descricao: 'Guarda os cookies que o servidor manda (`-c`) e devolve nas próximas requisições (`-b`), igual navegador. O arquivo vira segredo de sessão: trate como senha.',
  },
  {
    id: 'a4_politica',
    nome: 'Politica Contentus',
    comando: 'curl -sI https://loja.torneio.lab | grep -i content-security-policy',
    descricao: 'Procura o cabeçalho CSP na resposta. Se não aparecer nada, a página aceita script de qualquer lugar, que é o equivalente web de deixar a porta aberta com um tapete escrito "bem-vindo".',
  },
  {
    id: 'a4_salinum',
    nome: 'Salinum Aleatorium',
    comando: 'openssl rand -hex 16',
    descricao: 'Gera 16 bytes aleatórios em hexadecimal, bom para sal de senha ou token anti-CSRF. Aleatório de verdade, não "aniversário do cachorro".',
  },
  {
    id: 'a4_file',
    nome: 'Natura Fasciculi',
    comando: 'file --mime-type foto.jpg',
    descricao: 'Olha os primeiros bytes do arquivo (os "números mágicos") e diz o tipo real, sem acreditar na extensão. Extensão é fantasia de carnaval; o conteúdo é a pessoa embaixo.',
  },
  {
    id: 'a4_rastro',
    nome: 'Rastrum Statuum',
    comando: "cut -d' ' -f9 access.log | sort | uniq -c | sort -rn",
    descricao: 'Corta o nono campo de cada linha do log de acesso (o código de status, no formato combinado) e conta quantas vezes cada um aparece. Uma enxurrada de 403 ou 500 conta uma história sozinha.',
  },
  {
    id: 'a4_hmac',
    nome: 'Sigillum Placaris',
    comando: 'openssl dgst -sha256 -hmac "$CHAVE_PLACAR" placar.json',
    descricao: 'Calcula um HMAC-SHA256 do arquivo com uma chave secreta. Quem não tem a chave não consegue mudar o placar e refazer o selo. Integridade com assinatura de cartório.',
  },
];

export const criaturasAno4: Criatura[] = [
  {
    id: 'a4_grilo_aspa',
    nome: 'Grilo da Aspa Solta',
    real: 'Injeção SQL (categoria Injeção do OWASP Top 10): texto vindo do usuário é colado dentro de uma consulta ao banco e passa a ser lido como comando.',
    perigo: 5,
    descricao: 'Pula para dentro de qualquer formulário que junta texto com SQL na base da concatenação. Canta numa aspa simples e o banco inteiro começa a dançar a música dele.',
    defesa: 'Consultas parametrizadas (prepared statements) em todo acesso ao banco, ORM usado do jeito certo, validação de entrada como camada extra, conta do banco com menor privilégio e mensagens de erro genéricas para quem está do lado de fora.',
  },
  {
    id: 'a4_mico_script',
    nome: 'Mico do Script Alheio',
    real: 'Cross-site scripting (XSS): a página devolve texto de usuário sem escape e o navegador executa como JavaScript no contexto do site.',
    perigo: 4,
    descricao: 'Se esconde num comentário de avaliação de pão de queijo e, quando alguém abre a página, pega o que estiver solto: cookie sem proteção, formulário, a dignidade do site.',
    defesa: 'Escapar a saída conforme o contexto (HTML, atributo, JavaScript, URL), usar frameworks que escapam por padrão, cabeçalho Content-Security-Policy restritivo, cookies de sessão com HttpOnly e sanitizar HTML rico com biblioteca confiável.',
  },
  {
    id: 'a4_cuco_formulario',
    nome: 'Cuco do Formulário',
    real: 'Cross-site request forgery (CSRF): um site de fora faz o navegador da vítima enviar uma requisição a outro site onde ela já está logada.',
    perigo: 3,
    descricao: 'Bota o ovo no ninho dos outros: o pedido sai do seu navegador, com o seu cookie, mas quem escreveu foi ele. O site que recebe acha que foi você.',
    defesa: 'Token anti-CSRF imprevisível em todo formulário que muda estado, cookies com SameSite=Lax ou Strict, conferência do cabeçalho Origin, nada de GET para ação que altera dado e confirmação extra em operação sensível.',
  },
  {
    id: 'a4_quati_porta',
    nome: 'Quati da Porta Errada',
    real: 'IDOR (Insecure Direct Object Reference), um caso de controle de acesso quebrado, a categoria que lidera o OWASP Top 10: trocar um identificador na URL ou na API dá acesso ao dado de outra pessoa.',
    perigo: 4,
    descricao: 'Curioso, muda o número da porta de 1041 para 1042 só para ver. Se o servidor não perguntar "isso é seu?", ele entra, come o lanche e sai.',
    defesa: 'Checar no servidor, a cada requisição, se o objeto pertence a quem está pedindo; negar por padrão; testar autorização em todo endpoint; identificadores difíceis de adivinhar ajudam, mas nunca substituem a checagem.',
  },
  {
    id: 'a4_lagarta_upload',
    nome: 'Lagarta do Upload',
    real: 'Upload de arquivo sem restrição: o servidor aceita e às vezes executa um arquivo enviado pelo usuário, abrindo espaço para web shell.',
    perigo: 4,
    descricao: 'Chega vestida de `foto.jpg`, dorme na pasta de uploads e, se o servidor deixar, acorda borboleta com permissão de executar.',
    defesa: 'Lista de tipos permitidos conferida pelo conteúdo, não pela extensão; renomear com nome aleatório; guardar fora da pasta pública ou em armazenamento separado; proibir execução na pasta de uploads; limitar tamanho e passar antivírus.',
  },
  {
    id: 'a4_camaleao_login',
    nome: 'Camaleão do Login',
    real: 'Página de login adulterada no próprio servidor (credential harvesting): o formulário parece normal, mas manda uma cópia da senha para outro lugar.',
    perigo: 5,
    descricao: 'Tem a mesma cor da página verdadeira, o mesmo logo e o mesmo cadeado. Só muda um detalhe no formulário que ninguém olha. Foi ele que trocou de pele no servidor do torneio.',
    defesa: 'Monitoramento de integridade dos arquivos do servidor (FIM), deploy só por pipeline com revisão, conferência de hash do que está no ar, CSP com form-action restrito, MFA para que a senha sozinha não baste e revisão dos logs de alteração administrativa.',
  },
];

export const figurinhasAno4: Figurinha[] = [
  {
    id: 'a4_fig_berners_lee',
    nome: 'Tim Berners-Lee e a World Wide Web',
    ano: '1989',
    texto: 'No CERN, Tim Berners-Lee propôs em março de 1989 um sistema de documentos ligados por hipertexto. Em 1990 já tinha HTTP, HTML, URL, o primeiro servidor e o primeiro navegador. O chefe dele escreveu na proposta: "vago, mas empolgante". Melhor avaliação de desempenho da história.',
  },
  {
    id: 'a4_fig_montulli',
    nome: 'Lou Montulli e o cookie',
    ano: '1994',
    texto: 'Lou Montulli, na Netscape, criou o cookie HTTP em 1994 para a web lembrar de quem estava num carrinho de compras. O nome veio de "magic cookie", termo antigo de programação. O aviso de cookie que ninguém lê veio bem depois.',
  },
  {
    id: 'a4_fig_eich',
    nome: 'Brendan Eich e o JavaScript',
    ano: '1995',
    texto: 'Brendan Eich escreveu o primeiro protótipo do JavaScript em cerca de dez dias, em maio de 1995, na Netscape. Chamou-se Mocha, depois LiveScript, e virou JavaScript por marketing. Dez dias de prazo e trinta anos de suporte: todo dev conhece essa sensação.',
  },
  {
    id: 'a4_fig_ssl',
    nome: 'SSL, o cadeado da Netscape',
    ano: '1995',
    texto: 'A Netscape lançou o SSL 2.0 em 1995 (a versão 1.0 nunca saiu, de tão furada). Depois veio o SSL 3.0 e, em 1999, o TLS 1.0, padronizado pela IETF. Hoje o certo é TLS 1.2 ou 1.3, mas muita gente ainda diz "certificado SSL", igual quem chama todo refrigerante pela marca.',
  },
  {
    id: 'a4_fig_rfp',
    nome: 'A primeira descrição de injeção SQL',
    ano: '1998',
    texto: 'Em dezembro de 1998, Jeff Forristal, sob o apelido rain.forest.puppy, descreveu na revista eletrônica Phrack (edição 54) como dados de usuário podiam virar comandos num banco SQL. Mais de 25 anos depois, a injeção continua no OWASP Top 10. Aspa simples tem fôlego.',
  },
  {
    id: 'a4_fig_owasp',
    nome: 'Nasce o OWASP',
    ano: '2001',
    texto: 'O Open Worldwide Application Security Project (antes, Open Web Application Security Project) começou em 2001, com Mark Curphey, como comunidade aberta. A primeira lista Top 10 saiu em 2003. É gratuita, feita por voluntários e mais citada em edital do que muito livro.',
  },
  {
    id: 'a4_fig_samy',
    nome: 'O worm Samy',
    ano: '2005',
    texto: 'Em outubro de 2005, um XSS armazenado no MySpace se espalhou sozinho e adicionou mais de um milhão de amigos a um único perfil em cerca de 20 horas. O autor foi processado e condenado a serviço comunitário. Prova de que XSS não é só uma janelinha de alerta.',
  },
  {
    id: 'a4_fig_heartbleed',
    nome: 'Heartbleed',
    ano: '2014',
    texto: 'A CVE-2014-0160, no OpenSSL, deixava um atacante ler pedaços da memória do servidor pelo recurso de heartbeat do TLS, inclusive chaves e senhas. Ganhou nome, logo e site próprio, e lembrou o mundo de que muita infraestrutura dependia de pouquíssimos voluntários.',
  },
  {
    id: 'a4_fig_letsencrypt',
    nome: "Let's Encrypt",
    ano: '2015',
    texto: "A autoridade certificadora gratuita e automatizada Let's Encrypt emitiu seu primeiro certificado em setembro de 2015 e abriu ao público em dezembro. Ajudou a levar o HTTPS de luxo a padrão. Hoje site sem HTTPS é igual loja sem porta.",
  },
];

export const itensAno4: Item[] = [
  {
    id: 'a4_termo',
    nome: 'Termo de Autorização do Torneio',
    descricao: 'Uma folha assinada pelas três diretorias com escopo, horário, alvos permitidos e o que é proibido. Sem ele, o que você aprende este ano é crime. Com ele, é aula.',
  },
  {
    id: 'a4_cracha_torneio',
    nome: 'Crachá do Time Neblina',
    descricao: 'Crachá com as três bandeiras e o nome do seu time misto. Atrás, o Enzo escreveu "não sou seu amigo" e, em letra menor, mais tarde, "talvez um pouco".',
  },
  {
    id: 'a4_cuia',
    nome: 'Cuia de Chimarrão Emprestada',
    descricao: 'Presente da Lia. Vem com instrução de uso em três parágrafos e uma advertência: "não mexe na bomba". Serve também para lembrar que quem roda o comando é você, não a ferramenta.',
  },
  {
    id: 'a4_cordel_caio',
    nome: 'Cordel "A Peleja do Jonas com o Caio"',
    descricao: 'Folheto de cordel em xilogravura sobre o duelo de versos entre Caruaru e Juazeiro. Termina empatado, como deve ser.',
  },
  {
    id: 'a4_fonte',
    nome: 'Camada 4: a fonte da CHAVE MESTRA',
    descricao: 'Código-fonte incompleto da pasta NAO_ABRA, com o cabeçalho "PROJETO CHAVE MESTRA". Funções que falam em todas as redes bruxas, comentários assinados com "L." e um TODO no fim que nunca foi feito.',
  },
];
