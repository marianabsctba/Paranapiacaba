import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

export const feiticos6: Feitico[] = [
  {
    id: 'a6_sha256',
    nome: 'Digitalis Ducentum',
    comando: 'sha256sum amostra.bin',
    descricao: 'Tira a impressão digital SHA-256 de um arquivo. Mudou um bit, mudou o hash inteiro. É o RG da amostra, só que esse não dá pra tirar segunda via no Poupatempo.',
  },
  {
    id: 'a6_file',
    nome: 'Quid Est Filum',
    comando: 'file amostra.bin',
    descricao: 'Lê os primeiros bytes (os "magic bytes") e diz o que o arquivo é de verdade, ignorando a extensão. Desmascara `boleto.pdf.exe` em meio segundo.',
  },
  {
    id: 'a6_xxd',
    nome: 'Hexadecimus Spectaculum',
    comando: 'xxd amostra.bin | head',
    descricao: 'Mostra o arquivo em hexadecimal, com a tradução em texto do lado. Para quem quer ver o `MZ` com os próprios olhos.',
  },
  {
    id: 'a6_strings',
    nome: 'Chordae Revelio',
    comando: 'strings -n 8 amostra.bin',
    descricao: 'Puxa do binário todas as sequências de texto legível com pelo menos 8 caracteres. URL, caminho, senha esquecida, desabafo do programador: sai tudo.',
  },
  {
    id: 'a6_readelf',
    nome: 'Elfus Legendum',
    comando: 'readelf -h amostra.elf',
    descricao: 'Lê o cabeçalho de um executável ELF (Linux): classe, arquitetura, tipo e ponto de entrada. Nada de elfo de verdade, infelizmente.',
  },
  {
    id: 'a6_rabin2',
    nome: 'Importus Revelatus',
    comando: 'rabin2 -i amostra.exe',
    descricao: 'Lista as funções que o executável importa do sistema. Diga-me o que importas e te direi o que tramas.',
  },
  {
    id: 'a6_base64',
    nome: 'Basis Sexaginta Quattuor Reversio',
    comando: 'base64 -d trecho.txt',
    descricao: 'Desfaz Base64, a ofuscação preferida de quem acha que esconder é o mesmo que cifrar. Spoiler: não é.',
  },
  {
    id: 'a6_ent',
    nome: 'Entropia Mensura',
    comando: 'ent amostra.bin',
    descricao: 'Mede a entropia do arquivo em bits por byte, de 0 a 8. Perto de 8 é bagunça máxima: compactado, cifrado ou empacotado.',
  },
  {
    id: 'a6_upx',
    nome: 'Desembrulhus Presenti',
    comando: 'upx -d amostra.exe -o aberta.exe',
    descricao: 'Desempacota um executável comprimido com UPX. Só funciona com UPX honesto; malware costuma estragar o embrulho de propósito.',
  },
  {
    id: 'a6_yara',
    nome: 'Regula Yarae',
    comando: 'yara -r regras.yar amostras/',
    descricao: 'Varre uma pasta inteira com regras YARA e diz qual arquivo bateu em qual regra. É o cão farejador do analista, sem a parte de babar.',
  },
  {
    id: 'a6_strace',
    nome: 'Vestigium Vocationum',
    comando: 'strace -f -o rastro.txt ./amostra',
    descricao: 'Registra cada chamada de sistema que o programa faz (abrir arquivo, criar processo, conectar). Só dentro da sandbox, com rede cortada e snapshot pronto.',
  },
  {
    id: 'a6_tshark',
    nome: 'Auscultatio Nominum',
    comando: 'tshark -r captura.pcap -Y dns',
    descricao: 'Lê uma captura de rede e filtra só as consultas DNS. Todo malware que liga para casa precisa primeiro perguntar o endereço.',
  },
  {
    id: 'a6_vol_pslist',
    nome: 'Memoria Processuum',
    comando: 'vol -f memoria.raw windows.pslist',
    descricao: 'Volatility 3 lista os processos que estavam rodando quando a memória foi copiada. A foto da festa no exato momento em que a polícia chegou.',
  },
  {
    id: 'a6_vol_netscan',
    nome: 'Memoria Retium',
    comando: 'vol -f memoria.raw windows.netscan',
    descricao: 'Encontra na memória as conexões de rede e quem é dono de cada uma. O processo pode mentir o nome, mas não esconde para onde liga.',
  },
  {
    id: 'a6_vol_malfind',
    nome: 'Malum Inveniens',
    comando: 'vol -f memoria.raw windows.malfind',
    descricao: 'Procura regiões de memória executáveis e graváveis ao mesmo tempo, sem arquivo por trás. Lugar clássico de código injetado.',
  },
  {
    id: 'a6_jq',
    nome: 'Stixus Legendum',
    comando: "jq '.objects[].type' pacote.json",
    descricao: 'Lê um pacote STIX (que é JSON) e lista o tipo de cada objeto. Threat intel legível sem precisar rolar 4 mil linhas de chaves.',
  },
];

export const criaturas6: Criatura[] = [
  {
    id: 'a6_cavalo_feira',
    nome: 'Cavalo-de-Pau de Feira',
    real: 'Trojan (cavalo de Troia): programa que se disfarça de algo útil para a vítima executar',
    perigo: 3,
    descricao: 'Chega como "Atualizador de Boleto 2.0" ou "Figurinhas Grátis Bom Dia". Não se espalha sozinho: precisa que alguém clique. Infelizmente, alguém sempre clica.',
    defesa: 'Baixar só de fonte oficial, mostrar extensões de arquivo no sistema, bloquear execução em pastas de download (AppLocker ou WDAC), EDR e desconfiança treinada.',
  },
  {
    id: 'a6_rato_porao',
    nome: 'Rato-de-Porão Remoto',
    real: 'RAT (Remote Access Trojan): dá controle remoto da máquina ao atacante, com tela, teclado, arquivos e câmera',
    perigo: 4,
    descricao: 'Mora quietinho no porão do sistema e abre a porta para o dono quando ele chama. Adora ligar para casa em horário fixo, igual tia no domingo.',
    defesa: 'Monitorar conexões de saída e beaconing, bloquear domínios recém-criados, EDR com isolamento de máquina, menor privilégio e regras YARA para as famílias conhecidas.',
  },
  {
    id: 'a6_estivador',
    nome: 'Estivador Noturno',
    real: 'Loader ou dropper: malware pequeno cuja função é baixar ou descompactar e executar outro malware',
    perigo: 3,
    descricao: 'Não faz o estrago, só carrega a carga. É o motoboy do crime: chega, entrega e some. Muitas vezes o mesmo Estivador trabalha para várias quadrilhas.',
    defesa: 'Bloquear macros e scripts vindos da internet, filtrar downloads de domínios novos, observar processos filhos estranhos (Word abrindo PowerShell) e caçar o primeiro estágio antes da carga.',
  },
  {
    id: 'a6_gamba_cookies',
    nome: 'Gambá de Cookies',
    real: 'Infostealer: rouba senhas salvas no navegador, cookies de sessão, carteiras e arquivos, e manda tudo para o atacante',
    perigo: 4,
    descricao: 'Revira o lixo do navegador atrás de cookie e senha salva. Os "logs" que ele junta são vendidos em pacote, e é assim que acesso inicial vira mercadoria.',
    defesa: 'Gerenciador de senhas em vez do navegador, MFA resistente a phishing (chave FIDO2), sessões curtas, revogar tokens após incidente e não instalar crack de programa.',
  },
  {
    id: 'a6_cupim_kernel',
    nome: 'Cupim de Kernel',
    real: 'Rootkit: esconde a própria presença (processos, arquivos, conexões) mexendo no sistema operacional, às vezes no kernel',
    perigo: 5,
    descricao: 'Rói o sistema por dentro e faz o `ps` mentir para você. Quando aparece, a pergunta não é "onde ele está", é "em que mais eu ainda posso confiar".',
    defesa: 'Secure Boot, assinatura obrigatória de drivers, análise de memória feita de fora da máquina (Volatility num dump) e, na dúvida, reinstalar do zero a partir de mídia confiável.',
  },
  {
    id: 'a6_traca_apagadora',
    nome: 'Traça Apagadora',
    real: 'Wiper: malware feito para destruir dados de forma irrecuperável, às vezes disfarçado de ransomware',
    perigo: 5,
    descricao: 'Não quer resgate, quer terra arrasada. Às vezes pede pagamento só de enfeite, porque não guarda chave nenhuma. É a ex que apaga até o backup do Orkut.',
    defesa: 'Backup 3-2-1 com uma cópia offline e imutável, testes de restauração, segmentação de rede e contas administrativas separadas para que um computador caído não derrube todos.',
  },
  {
    id: 'a6_formigueiro_zumbi',
    nome: 'Formigueiro Zumbi',
    real: 'Bot e botnet: máquinas infectadas que obedecem a um servidor de comando e controle (C2), usadas para DDoS, spam ou fraude',
    perigo: 4,
    descricao: 'Cada formiguinha sozinha é boba. Mil delas recebendo ordem do mesmo formigueiro derrubam site de banco. Ama câmera IP com senha padrão e geladeira conectada.',
    defesa: 'Trocar senha padrão de todo dispositivo, atualizar firmware, segmentar IoT numa rede própria, bloquear saída para C2 conhecidos e derrubar o C2 com sinkhole junto com as autoridades.',
  },
];

export const figurinhas6: Figurinha[] = [
  {
    id: 'a6_fig_creeper',
    nome: 'Creeper',
    ano: '1971',
    texto: 'Programa experimental de Bob Thomas, na BBN, que pulava entre computadores PDP-10 da ARPANET mostrando "I\'M THE CREEPER: CATCH ME IF YOU CAN". Logo veio o Reaper para caçá-lo: o primeiro antivírus já nasceu correndo atrás.',
  },
  {
    id: 'a6_fig_elk_cloner',
    nome: 'Elk Cloner',
    ano: '1982',
    texto: 'Escrito por Rich Skrenta, então com 15 anos, para o Apple II. Viajava no setor de boot de disquetes e, na 50ª inicialização, mostrava um poeminha. Pegadinha de colégio que virou capítulo de livro de história.',
  },
  {
    id: 'a6_fig_brain',
    nome: 'Brain',
    ano: '1986',
    texto: 'Considerado o primeiro vírus de IBM PC, criado pelos irmãos Basit e Amjad Farooq Alvi, em Lahore, no Paquistão. Infectava o setor de boot de disquetes e trazia o endereço e o telefone deles dentro do código. OPSEC nota zero.',
  },
  {
    id: 'a6_fig_morris',
    nome: 'Morris Worm',
    ano: '1988',
    texto: 'Em 2 de novembro de 1988, o worm de Robert Tappan Morris, estudante de Cornell, atingiu milhares de máquinas, uma fatia enorme da internet da época. Levou à criação do CERT/CC e à primeira condenação nos EUA pela lei de fraude de computador.',
  },
  {
    id: 'a6_fig_iloveyou',
    nome: 'ILOVEYOU',
    ano: '2000',
    texto: 'Em maio de 2000, um e-mail com o anexo LOVE-LETTER-FOR-YOU.TXT.vbs, vindo das Filipinas, infectou milhões de computadores no mundo. A extensão dupla escondia um script. Desde então, desconfie de declaração de amor com .vbs no final.',
  },
  {
    id: 'a6_fig_stuxnet',
    nome: 'Stuxnet',
    ano: '2010',
    texto: 'Identificado em 2010 a partir de amostras analisadas pela VirusBlokAda, de Belarus. Mirava controladores Siemens da usina de Natanz, no Irã, e usava quatro vulnerabilidades zero-day no Windows. Provou que código também gira centrífuga.',
  },
  {
    id: 'a6_fig_wannacry',
    nome: 'WannaCry',
    ano: '2017',
    texto: 'Em 12 de maio de 2017, esse ransomware se espalhou pelo SMBv1 usando o EternalBlue (a falha do MS17-010, com correção publicada em março). Foi freado quando o pesquisador Marcus Hutchins registrou o domínio de "kill switch" que estava no código.',
  },
  {
    id: 'a6_fig_ghidra',
    nome: 'Ghidra',
    ano: '2019',
    texto: 'Em março de 2019, a NSA liberou como software livre o Ghidra, sua ferramenta de engenharia reversa com desassemblador e descompilador. De repente, ler binário deixou de exigir licença cara. A comunidade agradeceu e foi procurar backdoor no próprio Ghidra.',
  },
];

export const itens6: Item[] = [
  {
    id: 'a6_jaleco',
    nome: 'Jaleco de Analista',
    descricao: 'Jaleco branco com bordado nas costas: "não executo amostra fora da sandbox". Tem um bolso só para o pendrive lacrado e outro para a paçoca.',
  },
  {
    id: 'a6_poster_pe',
    nome: 'Pôster do Cabeçalho PE',
    descricao: 'Pôster para a parede do dormitório com o mapa do formato PE, do `MZ` até a `.rsrc`. A Tati plastificou. Duas vezes.',
  },
  {
    id: 'a6_caneca_yara',
    nome: 'Caneca "condition: café"',
    descricao: 'Caneca com uma regra YARA impressa: `condition: cafe and not segunda_feira`. Presente de Natal da turma. Já bateu em falso positivo numa terça.',
  },
  {
    id: 'a6_pendrive_lacrado',
    nome: 'Pendrive Lacrado de 2015',
    descricao: 'Pendrive com lacre de evidência assinado por Heitor Lisboa e Lena, datado de novembro de 2015. Dentro, a cópia original do código da sua mãe, com hash anotado à mão.',
  },
  {
    id: 'a6_luminaria_hex',
    nome: 'Luminária Hexadecimal',
    descricao: 'Abajur que mostra a hora em hexadecimal na parede do dormitório. O Cauã consertou com fita isolante e agora ele também mostra o `MZ` à meia-noite.',
  },
  {
    id: 'a6_camada6',
    nome: 'Camada 6 da pasta NAO_ABRA: as coordenadas',
    descricao: 'Um objeto STIX do tipo `location`, assinado pela sua mãe, com latitude, longitude e um nome: "Oficina do Bem-te-vi", no Vale do Ribeira. E uma frase: "ainda não venha sozinh{o/a/e}".',
  },
];

export const lugares6: Lugar[] = [
  {
    id: 'a6_lab_reverso',
    nome: 'Laboratório de Engenharia Reversa',
    descricao: 'Antiga oficina de locomotivas virou laboratório: bancadas de ferro, monitores em fila e um quadro-negro com o cabeçalho PE desenhado a giz desde 1998.',
    ano: 6,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a6_strings',
        texto: 'Você roda Chordae Revelio na velha imagem de disco pendurada no quadro. Entre lixo binário, uma linha: "L. e H. esqueceram a cafeteira ligada, 2014". Alguém trabalhou aqui com a sua mãe.',
        efeito: { xp: 30, atributos: { forense: 1 }, flag: 'a6_segredo_lab_lh' },
      },
      {
        feitico: 'a6_file',
        texto: 'O "manual.pdf" esquecido na bancada é, segundo Quid Est Filum, um arquivo ZIP. Dentro, uma lista de laboratório da Profa. Marta: "nunca dê dois cliques. Nem um".',
        efeito: { xp: 20, atributos: { sistemas: 1 } },
      },
      {
        feitico: 'a6_xxd',
        texto: 'Em hexadecimal, o arquivo `sorte.bin` da gaveta diz em ASCII: "PARABENS, VOCE OLHOU". Embaixo, um bombom ainda dentro da validade. Analista curios{o/a/e} come bem.',
        efeito: { xp: 15, item: 'a6_luminaria_hex' },
      },
    ],
  },
  {
    id: 'a6_caixa_areia',
    nome: 'Caixa de Areia',
    descricao: 'Sala sem janela, sem Wi-Fi e sem cabo para fora, com máquinas virtuais que voltam ao snapshot limpo toda noite. Mora ali o Siri Sandbox, que belisca quem traz pendrive pessoal.',
    ano: 6,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a6_strace',
        texto: 'Vestigium Vocationum no velho script de manutenção revela que ele abre `/etc/saudade` toda noite. É só um arquivo com uma foto do Siri filhote. O Siri finge que não viu você ler.',
        efeito: { xp: 20, amizade: { a6_siri: 2 } },
      },
      {
        feitico: 'a6_sha256',
        texto: 'Você confere o hash do snapshot limpo contra o anotado na parede. Bateu. É a primeira vez em seis anos que alguém confere, diz o Siri, emocionado.',
        efeito: { xp: 25, atributos: { forense: 1 }, pontosCasa: 5 },
      },
    ],
  },
  {
    id: 'a6_arquivo_morto',
    nome: 'Arquivo Morto do Viveiro',
    descricao: 'Porão embaixo do Viveiro com gaiolas de contenção antigas, etiquetadas a mão. Algumas guardam amostras de antes do Grande Apagão. O Baltazar só entra cantando.',
    ano: 6,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a6_yara',
        texto: 'Regula Yarae na prateleira de 2015 bate numa gaiola sem etiqueta: "sensor_bemtevi_v1". Não é malware. É uma ferramenta de defesa. Da sua mãe.',
        efeito: { xp: 40, atributos: { defesa: 1 }, flag: 'a6_sensor_original' },
      },
      {
        feitico: 'a6_ent',
        texto: 'Entropia Mensura numa gaiola marcada "inofensivo" mostra 7,99 bits por byte. Inofensivo nada: está cifrado. O Baltazar troca a etiqueta resmungando.',
        efeito: { xp: 20, atributos: { forense: 1 } },
      },
      {
        feitico: 'a6_rabin2',
        texto: 'Importus Revelatus numa amostra de 2009 mostra só `MessageBoxA`. É uma pegadinha antiga de aluno que abria uma janela dizendo "você foi hackead{o/a/e}". O Baltazar ri até chorar.',
        efeito: { xp: 15, amizade: { baltazar: 2 } },
      },
    ],
  },
  {
    id: 'a6_galeria_dumps',
    nome: 'Galeria dos Dumps',
    descricao: 'No alto da Torre das Antenas, uma sala gelada com discos rotulados "memória de". A Profa. Nanda chama de "álbum de fotos do pior dia de cada máquina".',
    ano: 6,
    cena: 'torre',
    segredos: [
      {
        feitico: 'a6_vol_pslist',
        texto: 'Memoria Processuum num dump de 2011 mostra um processo chamado `paciencia.exe` rodando há 300 horas no computador da Diretora. Ninguém comenta.',
        efeito: { xp: 15, amizade: { iolanda: 1 } },
      },
      {
        feitico: 'a6_vol_malfind',
        texto: 'Malum Inveniens num dump marcado "Apagão, 2015" mostra uma região injetada com um comentário em ASCII: "rastreando G.N.". Seus pais estavam dentro da máquina do inimigo.',
        efeito: { xp: 40, atributos: { forense: 2 }, flag: 'a6_dump_apagao' },
      },
      {
        feitico: 'a6_jq',
        texto: 'Stixus Legendum num pacote antigo da prateleira lista um objeto `identity` com o nome "Oficina do Bem-te-vi". Você já viu esse nome no notebook da sua mãe.',
        efeito: { xp: 25, atributos: { forense: 1 } },
      },
    ],
  },
];

export const personagens6: Personagem[] = [
  {
    id: 'a6_marta',
    nome: 'Profa. Marta Ibiapina',
    papel: 'Engenharia Reversa, de Teresina, lê hexadecimal como quem lê cardápio e nunca, jamais, dá dois cliques',
    cor: '#f28482',
    pele: '#a0673d',
    cabelo: '#1b1b1b',
    estilo: 'cacheado',
    oculos: true,
    roupa: '#f1f1f1',
  },
  {
    id: 'a6_siri',
    nome: 'Siri Sandbox',
    papel: 'siri que mora na Caixa de Areia, guardião das máquinas virtuais, belisca pendrive pessoal',
    cor: '#ff9f1c',
    pele: '#e76f51',
    cabelo: '#e76f51',
    estilo: 'bicho',
    roupa: '#e76f51',
  },
];
