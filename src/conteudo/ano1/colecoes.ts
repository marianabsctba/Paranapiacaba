import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

export const personagensAno1: Personagem[] = [
  {
    id: 'a1_dalva',
    nome: 'Profa. Dalva Mendonça',
    papel: 'professora substituta de Persuasão e Engano, distribui biscoito e sorriso com a mesma generosidade',
    cor: '#f28482',
    pele: '#f1d6c0',
    cabelo: '#c9a227',
    estilo: 'longo',
    oculos: true,
    roupa: '#7d4e57',
  },
  {
    id: 'a1_cleide',
    nome: 'Dona Cleide',
    papel: 'dona da banca de teclados encantados da Galeria Oculta, solda de olho fechado e não dá nota',
    cor: '#f6bd60',
    pele: '#8d5524',
    cabelo: '#5e3023',
    estilo: 'cacheado',
    roupa: '#3d405b',
  },
  {
    id: 'a1_edite',
    nome: 'Pomba Edite',
    papel: 'pomba-correio da família, entrega por RFC 1149 e tem latência de três dias',
    cor: '#c8d5b9',
    pele: '#9a9a9a',
    cabelo: '#9a9a9a',
    estilo: 'bicho',
    roupa: '#6b705c',
  },
];

export const feiticosAno1: Feitico[] = [
  {
    id: 'a1_localizum',
    nome: 'Localizum',
    comando: 'pwd',
    descricao: 'Mostra o caminho completo da pasta onde você está agora. É o "você está aqui" do mapa do shopping, só que sem a loja de colchão na frente.',
  },
  {
    id: 'a1_listarium',
    nome: 'Listarium',
    comando: 'ls',
    descricao: 'Lista o que existe dentro de uma pasta. O primeiro feitiço de quem chega numa máquina nova e o último de quem já não confia em mais nada.',
  },
  {
    id: 'a1_caminhus',
    nome: 'Caminhus Mutatio',
    comando: 'cd',
    descricao: 'Muda de pasta. `cd ..` sobe um nível, `cd` sozinho volta para casa. Mais confiável que o GPS na serra.',
  },
  {
    id: 'a1_catalogus',
    nome: 'Catalogus',
    comando: 'cat',
    descricao: 'Mostra o conteúdo de um arquivo de texto na tela. O nome vem de "concatenate" (juntar), não do gato, apesar do que o Bitu acha.',
  },
  {
    id: 'a1_manualis',
    nome: 'Manualis Consultatio',
    comando: 'man',
    descricao: 'Abre o manual oficial de um comando. A Zuleica diz que é a única coisa que responde sem mandar "pesquisa no Google".',
  },
  {
    id: 'a1_pastum',
    nome: 'Pastum Criatio',
    comando: 'mkdir',
    descricao: 'Cria uma pasta nova. Com `-p`, cria a pasta e todas as pastas do caminho que faltarem, como quem monta um armário inteiro só para guardar uma meia.',
  },
  {
    id: 'a1_tactus',
    nome: 'Tactus Nascitur',
    comando: 'touch',
    descricao: 'Cria um arquivo vazio, ou atualiza a data de um que já existe. Um toque e pronto, nasce um arquivo.',
  },
  {
    id: 'a1_duplicatus',
    nome: 'Duplicatus',
    comando: 'cp',
    descricao: 'Copia arquivos (e pastas inteiras com `-r`). Útil para fazer backup antes de mexer, prática que salva mais carreiras que café.',
  },
  {
    id: 'a1_movimentum',
    nome: 'Movimentum Renomeatus',
    comando: 'mv',
    descricao: 'Move ou renomeia arquivos. Para o computador, mudar de nome e mudar de lugar são a mesma coisa, igual ao seu primo que se mudou para Portugal e virou "Joaquim".',
  },
  {
    id: 'a1_obliterus',
    nome: 'Obliterus Definitivus',
    comando: 'rm',
    descricao: 'Apaga arquivos de verdade, sem lixeira e sem "desfazer". Use com respeito, como quem segura um ferro de solda ligado.',
  },
  {
    id: 'a1_revelio',
    nome: 'Revelio Occultum',
    comando: 'ls -a',
    descricao: 'Lista inclusive os arquivos ocultos, aqueles cujo nome começa com ponto. Revela configurações, segredos de família e um ou outro malware tímido.',
  },
  {
    id: 'a1_listarium_longus',
    nome: 'Listarium Longus',
    comando: 'ls -l',
    descricao: 'Lista em formato longo: permissões, dono, grupo, tamanho e data. É o RG completo de cada arquivo.',
  },
  {
    id: 'a1_permissio',
    nome: 'Permissio Mutatio',
    comando: 'chmod',
    descricao: 'Muda as permissões de leitura, escrita e execução de um arquivo. Feitiço preferido de quem já viu um `777` em produção e nunca mais dormiu direito.',
  },
  {
    id: 'a1_quis_sum',
    nome: 'Quis Sum',
    comando: 'whoami',
    descricao: 'Responde com qual usuário você está logado. Pergunta existencial que o terminal responde em uma palavra, coisa que a terapia não faz.',
  },
  {
    id: 'a1_superusuarium',
    nome: 'Superusuarium Facio',
    comando: 'sudo',
    descricao: 'Executa um comando com poderes de administrador (root), pedindo a sua senha e deixando registro. Não é "por favor", é "eu assumo a responsabilidade".',
  },
  {
    id: 'a1_atualizatio',
    nome: 'Atualizatio Totalis',
    comando: 'sudo apt update && sudo apt upgrade',
    descricao: 'Atualiza a lista de pacotes e instala as correções disponíveis. O feitiço mais chato e mais eficaz de todo o grimório.',
  },
];

export const criaturasAno1: Criatura[] = [
  {
    id: 'a1_isca_dagua',
    nome: 'Isca-d’Água',
    real: 'Phishing com falsificação de remetente (spoofing): mensagens que imitam alguém confiável para roubar senha ou fazer a vítima clicar',
    perigo: 3,
    descricao: 'Peixe prateado que muda de cor e de nome para imitar qualquer remetente: a Diretoria, o banco, a sua avó. Cheira levemente a "urgente".',
    defesa: 'Conferir o domínio real do remetente e o destino do link antes de clicar, desconfiar de urgência, confirmar por outro canal, reportar à equipe de segurança e usar MFA resistente a phishing. Do lado do servidor de e-mail: SPF, DKIM e DMARC.',
  },
  {
    id: 'a1_jabuti_brinde',
    nome: 'Jabuti de Brinde',
    real: 'Cavalo de Troia (trojan): programa que se apresenta como algo útil ou gratuito e esconde uma função maliciosa',
    perigo: 3,
    descricao: 'Chega embrulhado em papel de presente com laço: "jogo grátis", "crack do editor", "cupom de 90%". Por dentro do casco, só problema.',
    defesa: 'Instalar programas só de fontes oficiais, nunca rodar crack ou "ativador", conferir extensão real do arquivo e manter antivírus/EDR ligado e atualizado.',
  },
  {
    id: 'a1_sanguessuga',
    nome: 'Sanguessuga de Senha',
    real: 'Keylogger e infostealer: malware que grava o que se digita ou rouba senhas e cookies salvos no navegador',
    perigo: 4,
    descricao: 'Gruda embaixo do teclado e chupa cada tecla. Engorda rápido em computador de lan house.',
    defesa: 'Não digitar senha em computador desconhecido, manter o sistema atualizado, usar gerenciador de senhas e MFA (a senha roubada sozinha não basta), e trocar senhas e encerrar sessões ao suspeitar de infecção.',
  },
  {
    id: 'a1_pernilongo',
    nome: 'Pernilongo do Pop-up',
    real: 'Adware: programa que enche a tela de anúncios, troca a página inicial do navegador e às vezes abre a porta para coisa pior',
    perigo: 1,
    descricao: 'Zumbe "PARABÉNS, VOCÊ GANHOU" no ouvido às três da manhã. Inofensivo sozinho, insuportável em enxame.',
    defesa: 'Não instalar extensões e "otimizadores" desconhecidos, recusar caixas pré-marcadas em instaladores, revisar extensões do navegador e remover o que você não reconhece.',
  },
  {
    id: 'a1_morcego_boleto',
    nome: 'Morcego do Boleto',
    real: 'Malware bancário brasileiro que adultera o código de barras de boletos no computador da vítima, desviando o pagamento (casos reais documentados a partir de 2014)',
    perigo: 4,
    descricao: 'Pendura-se de cabeça para baixo dentro do navegador e troca os números do boleto enquanto você pisca. Adora fim de mês.',
    defesa: 'Antes de pagar, conferir no app do banco o nome do beneficiário e o valor, desconfiar de boleto que chegou por canal estranho, e manter sistema e navegador atualizados.',
  },
  {
    id: 'a1_lagartixa_usb',
    nome: 'Lagartixa de Pendrive',
    real: 'Worm que se espalha por mídia removível: copia-se para pendrives e infecta cada computador onde o pendrive é espetado',
    perigo: 3,
    descricao: 'Mora dentro de pendrive achado no chão do estacionamento. Pula de computador em computador sem pedir licença.',
    defesa: 'Nunca espetar pendrive achado ou de origem desconhecida, desativar a execução automática de mídias, manter antivírus que verifica mídia removível e preferir compartilhamento controlado.',
  },
];

export const figurinhasAno1: Figurinha[] = [
  {
    id: 'a1_ada_lovelace',
    nome: 'Ada Lovelace',
    ano: '1843',
    texto: 'Publicou notas sobre a Máquina Analítica de Charles Babbage com um método para calcular números de Bernoulli, considerado o primeiro programa de computador. A máquina nem foi construída, e mesmo assim ela já tinha código pronto. Mais organizada que muita startup.',
  },
  {
    id: 'a1_alan_turing',
    nome: 'Alan Turing',
    ano: '1936',
    texto: 'No artigo "On Computable Numbers" descreveu a máquina de Turing, modelo teórico de tudo que um computador consegue calcular. Na Segunda Guerra trabalhou em Bletchley Park quebrando a Enigma. Fez mais pela computação que qualquer palestrante de "mindset".',
  },
  {
    id: 'a1_eniac',
    nome: 'ENIAC',
    ano: '1946',
    texto: 'Computador eletrônico apresentado em 1946 na Universidade da Pensilvânia, com cerca de 17.468 válvulas e umas 27 toneladas. Foi programado por seis mulheres, entre elas Kay McNulty, Betty Jennings e Frances Bilas, ligando cabos à mão. Sem Stack Overflow.',
  },
  {
    id: 'a1_grace_hopper',
    nome: 'Grace Hopper',
    ano: '1947',
    texto: 'A equipe dela no Harvard Mark II achou uma mariposa presa num relé e colou no caderno de registro: "primeiro caso real de bug encontrado". Hopper também criou um dos primeiros compiladores e influenciou o COBOL, que ainda roda em banco por aí.',
  },
  {
    id: 'a1_unix',
    nome: 'Unix',
    ano: '1969',
    texto: 'Ken Thompson e Dennis Ritchie começaram o Unix nos Bell Labs. Dele vieram ideias que você usa todo dia no terminal: tudo é arquivo, programas pequenos que se combinam, `ls`, `cd`, `cat`. O Linux é inspirado nele. Respeite os mais velhos.',
  },
  {
    id: 'a1_creeper',
    nome: 'Creeper',
    ano: '1971',
    texto: 'Bob Thomas, na BBN, escreveu o Creeper, programa experimental que pulava entre computadores da ARPANET mostrando "I’M THE CREEPER: CATCH ME IF YOU CAN". Logo depois surgiu o Reaper para caçá-lo, avô de todo antivírus. Já nasceu com briga.',
  },
  {
    id: 'a1_morris_worm',
    nome: 'Worm de Morris',
    ano: '1988',
    texto: 'Robert Tappan Morris soltou um worm que derrubou milhares de máquinas, uma fatia grande da internet da época. Foi a primeira condenação pela lei americana de fraude de computador (CFAA), e o caso ajudou a criar o primeiro CERT. Era para ser um experimento. Sempre é.',
  },
  {
    id: 'a1_rfc1149',
    nome: 'RFC 1149',
    ano: '1990',
    texto: 'Publicada em 1º de abril por David Waitzman, descreve como transmitir pacotes IP por pombos-correio. Era piada, mas em 2001 um grupo de usuários de Linux de Bergen, na Noruega, testou de verdade. A Pomba Edite exige que você respeite a especificação.',
  },
];

export const itensAno1: Item[] = [
  {
    id: 'a1_teclado',
    nome: 'Varinha: teclado mecânico encantado',
    descricao: 'Teclado de switch que estala como pipoca, escolhido na banca da Dona Cleide. A tecla Enter brilha quando um comando está certo e esfria quando você vai fazer besteira.',
  },
  {
    id: 'a1_moletom_casa',
    nome: 'Moletom da Casa',
    descricao: 'Moletom com o bicho da sua casa bordado no peito e um bolso secreto do tamanho exato de um pendrive (que você não vai espetar em lugar nenhum).',
  },
  {
    id: 'a1_poster',
    nome: 'Pôster "Funciona na minha máquina"',
    descricao: 'Enfeite de dormitório com um servidor em chamas e a frase em letras douradas. Combina com qualquer beliche e com qualquer desculpa.',
  },
  {
    id: 'a1_panetone',
    nome: 'Panetone da Vó Cida',
    descricao: 'Chegou por pombo, embrulhado em três sacolas de mercado e um bilhete impresso: "não abra links de desconhecidos e coma a fruta cristalizada, que é saudável".',
  },
  {
    id: 'a1_chave_seguranca',
    nome: 'Chave de segurança FIDO2',
    descricao: 'Chaveirinho que prova quem você é e só responde para o site verdadeiro. Phishing nenhum consegue enganá-la, porque ela confere o domínio sozinha.',
  },
  {
    id: 'a1_foto_pais',
    nome: 'Camada 1: a foto dos seus pais',
    descricao: 'Primeira camada da pasta NAO_ABRA: uma foto do Rui e da Lena rindo na frente de um rack, com um bilhete no verso: "se você leu isso, aprendeu `ls -a`".',
  },
];

export const lugaresAno1: Lugar[] = [
  {
    id: 'a1_clube_duelos',
    nome: 'Clube de Duelos',
    descricao: 'Antigo galpão de locomotivas com um tablado no meio e um placar de LED que só tem metade dos segmentos funcionando.',
    ano: 1,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a1_revelio',
        texto: 'Atrás do placar existe um arquivo oculto `.ranking_de_verdade`. Nele aparecem todas as derrotas que o Enzo apagou do ranking público. São muitas.',
        efeito: { xp: 20, atributos: { sistemas: 1 } },
      },
      {
        feitico: 'a1_catalogus',
        texto: 'O regulamento do clube, regra 1: "quem encostar no teclado do adversário perde". Regra 2, escrita à caneta: "inclusive o Bitu".',
        efeito: { xp: 10, amizade: { bitu: 1 } },
      },
    ],
  },
  {
    id: 'a1_pombal',
    nome: 'Pombal da Torre',
    descricao: 'Andar de cima da Torre das Antenas, onde os pombos-correio dormem entre roteadores. A taxa de perda de pacotes depende do vento.',
    ano: 1,
    cena: 'torre',
    segredos: [
      {
        feitico: 'a1_listarium',
        texto: 'A lista dos pombos de plantão: Edite, Datagrama, Pacotinho, Checksum e Jitter (este último sempre chega fora de ordem).',
        efeito: { xp: 10, amizade: { a1_edite: 1 } },
      },
      {
        feitico: 'a1_manualis',
        texto: 'Um manual plastificado da RFC 1149 pendurado num prego, com uma nota: "pombo não é UDP, ele volta".',
        efeito: { xp: 15, figurinha: 'a1_rfc1149' },
      },
      {
        feitico: 'a1_revelio',
        texto: 'Embaixo da palha, um arquivo oculto `.rota_noturna` registra um pombo sem nome que saiu toda sexta às 3h na direção da represa.',
        efeito: { xp: 20, flag: 'a1_pombo_noturno', atributos: { forense: 1 } },
      },
    ],
  },
  {
    id: 'a1_sala_persuasao',
    nome: 'Sala de Persuasão e Engano',
    descricao: 'Sala acolhedora demais: almofadas, cheiro de biscoito e um quadro que diz "confie em mim". Isso já devia ter sido um sinal.',
    ano: 1,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a1_revelio',
        texto: 'Na pasta da professora, um arquivo oculto `.cartas_para_N` aparece. O conteúdo é cifrado, mas o nome já diz bastante.',
        efeito: { xp: 25, flag: 'a1_cartas_para_n', atributos: { forense: 1 } },
      },
      {
        feitico: 'a1_listarium_longus',
        texto: 'O arquivo `modelos_de_email.txt` pertence ao usuário `dalva`, grupo `nulo`. Grupo esquisito para uma professora substituta.',
        efeito: { xp: 25, atributos: { sistemas: 1 } },
      },
      {
        feitico: 'a1_quis_sum',
        texto: 'O computador da sala responde `whoami` com `diretoria`. Alguém criou um usuário com nome de autoridade para assinar e-mails.',
        efeito: { xp: 20, atributos: { social: 1 } },
      },
    ],
  },
  {
    id: 'a1_galeria_formandos',
    nome: 'Galeria dos Formandos',
    descricao: 'Corredor comprido com fotos de todas as turmas desde 1899. Os retratos piscam quando alguém digita errado perto deles.',
    ano: 1,
    cena: 'castelo',
    segredos: [
      {
        feitico: 'a1_listarium',
        texto: 'A lista de molduras tem um buraco: `turma_2003` está sem uma foto. Na plaqueta, um nome raspado que ainda dá para ler: Gabriel Nunes.',
        efeito: { xp: 20, flag: 'a1_viu_gabriel' },
      },
      {
        feitico: 'a1_revelio',
        texto: 'Uma foto oculta atrás da turma de 2004: duas pessoas jovens segurando um cabo de rede como se fosse troféu. No verso: "Rui e Lena, campeões de Capturebol".',
        efeito: { xp: 30, flag: 'a1_viu_pais_galeria', amizade: { iolanda: 1 } },
      },
      {
        feitico: 'a1_quis_sum',
        texto: 'O retrato da Diretora Iolanda jovem pergunta "quem é você?". Você digita `whoami` e o quadro responde: "ainda descobrindo, igual a todo mundo".',
        efeito: { xp: 10 },
      },
    ],
  },
];
