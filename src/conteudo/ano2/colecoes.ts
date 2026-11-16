import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

export const feiticos2: Feitico[] = [
  {
    id: 'a2_f_ip_a',
    nome: 'Interfacium Monstrare',
    comando: 'ip a',
    descricao: 'Mostra as placas de rede da máquina, com IP, máscara e MAC. É o RG da sua máquina na rede, só que sem foto feia.',
  },
  {
    id: 'a2_f_ipconfig',
    nome: 'Configuratio Fenestrae',
    comando: 'ipconfig /all',
    descricao: 'A versão Windows do raio X da rede: IP, máscara, gateway, DNS e MAC. Funciona até no computador da recepção que ninguém atualiza desde 2019.',
  },
  {
    id: 'a2_f_ipcalc',
    nome: 'Calculus Retis',
    comando: 'ipcalc 192.168.10.37/26',
    descricao: 'Faz a conta de sub-rede para você: rede, broadcast, primeiro e último host. Não substitui entender a conta, mas salva a prova.',
  },
  {
    id: 'a2_f_ip_neigh',
    nome: 'Vicinia Revelare',
    comando: 'ip neigh',
    descricao: 'Lista a tabela ARP: quais IPs vizinhos têm qual MAC. É a lista de vizinhos do condomínio, com o número do apartamento de cada um.',
  },
  {
    id: 'a2_f_ip_route',
    nome: 'Itinerarium Ostendere',
    comando: 'ip route',
    descricao: 'Mostra a tabela de rotas, incluindo o gateway padrão: a porta por onde sai tudo o que não é da rede local.',
  },
  {
    id: 'a2_f_ping',
    nome: 'Ecoarium',
    comando: 'ping -c 4',
    descricao: 'Manda um eco ICMP e espera resposta. É o "oi, sumido" das redes: se responder, está vivo; se não responder, pode estar só te ignorando.',
  },
  {
    id: 'a2_f_traceroute',
    nome: 'Vestigium Sequi',
    comando: 'traceroute',
    descricao: 'Revela cada roteador no caminho até o destino, salto a salto. No Windows o nome é tracert, porque o Windows gosta de economizar letra.',
  },
  {
    id: 'a2_f_nc',
    nome: 'Portam Pulsare',
    comando: 'nc -zv',
    descricao: 'Bate na porta TCP de um servidor e diz se alguém atende. Educado: não entra, só bate. Use só em rede onde você tem autorização.',
  },
  {
    id: 'a2_f_ss',
    nome: 'Auscultatio Portarum',
    comando: 'ss -tuln',
    descricao: 'Lista as portas que a sua máquina está escutando. Descobre o serviço que alguém instalou "só para testar" em 2021 e esqueceu ligado.',
  },
  {
    id: 'a2_f_netstat',
    nome: 'Netstatus Antiquus',
    comando: 'netstat -ano',
    descricao: 'O avô do ss, ainda firme no Windows: conexões, portas em escuta e o PID de quem abriu cada uma.',
  },
  {
    id: 'a2_f_nslookup',
    nome: 'Nomen Quaerere',
    comando: 'nslookup',
    descricao: 'Pergunta ao DNS qual IP tem um nome. Existe em quase todo sistema, inclusive no notebook da Vó.',
  },
  {
    id: 'a2_f_dig',
    nome: 'Fossorium Nominis',
    comando: 'dig',
    descricao: 'O nslookup que fez pós-graduação: mostra registro, TTL, servidor que respondeu e detalhes que ninguém pediu mas todo mundo precisa.',
  },
  {
    id: 'a2_f_nmcli',
    nome: 'Aetherium Videre',
    comando: 'nmcli dev wifi list',
    descricao: 'Lista as redes Wi-Fi ao redor, com canal, sinal e tipo de segurança. Revela o vizinho que ainda usa WEP.',
  },
  {
    id: 'a2_f_ufw',
    nome: 'Murus Ignis',
    comando: 'sudo ufw status',
    descricao: 'Mostra e cria regras de firewall no Linux sem sofrer com a sintaxe do iptables. Muro bom é muro com regra escrita.',
  },
];

export const criaturas2: Criatura[] = [
  {
    id: 'a2_lacraia_cobre',
    nome: 'Lacraia de Cobre',
    real: 'Worm de rede que se espalha sozinho por SMB (porta 445), testando senhas fracas e falhas sem correção em cada máquina vizinha',
    perigo: 5,
    descricao: 'Tem uma perna para cada máquina que já infectou e anda pelo cabo de cobre como se fosse trilho. Não precisa de ninguém clicar em nada: basta uma porta aberta e uma senha preguiçosa.',
    defesa: 'Aplicar as atualizações de segurança, desativar SMBv1, fechar a 445 para quem não precisa, senhas fortes e diferentes, e segmentar a rede para que uma sala infectada não alcance as outras.',
  },
  {
    id: 'a2_cupim_roteador',
    nome: 'Cupim de Roteador',
    real: 'Botnet de IoT no estilo do Mirai (2016), que entra em câmeras e roteadores por Telnet com usuário e senha de fábrica',
    perigo: 4,
    descricao: 'Rói por dentro geladeira, câmera e roteador, e depois todos os cupins mordem o mesmo alvo ao mesmo tempo. Foi a família dessa praga que o Nulo criou com as geladeiras da vila.',
    defesa: 'Trocar a senha de fábrica no primeiro dia, desligar Telnet e acesso remoto, atualizar o firmware e manter aparelho de IoT numa rede separada.',
  },
  {
    id: 'a2_marimbondo_syn',
    nome: 'Marimbondo SYN',
    real: 'Ataque de negação de serviço por SYN flood: milhares de pedidos de conexão TCP que nunca terminam o aperto de mão',
    perigo: 3,
    descricao: 'Zumbe "SYN, SYN, SYN" sem parar e nunca responde o ACK. O servidor fica segurando conexões pela metade até não caber mais ninguém, como fila de cartório com gente que pegou senha e foi embora.',
    defesa: 'Ativar SYN cookies, limitar taxa de conexões, usar serviço anti-DDoS ou balanceador na frente e monitorar picos de conexões em SYN_RECV.',
  },
  {
    id: 'a2_sapo_dns',
    nome: 'Sapo-Cururu do DNS',
    real: 'Sequestro de DNS: o atacante troca o servidor DNS do roteador (como fazia o DNSChanger) ou falsifica respostas para mandar a vítima a um site falso',
    perigo: 4,
    descricao: 'Senta no meio da estrada e, quando você pergunta onde fica o banco, aponta com a língua para a casa dele. A placa está certa; quem mente é o sapo.',
    defesa: 'Senha forte e firmware atualizado no roteador, conferir qual DNS a máquina está usando, preferir resolvedores confiáveis, DNSSEC no lado do domínio e sempre verificar o HTTPS e o certificado.',
  },
  {
    id: 'a2_papagaio_arp',
    nome: 'Papagaio Falsário',
    real: 'ARP spoofing: uma máquina responde "esse IP sou eu" com o MAC dela e se coloca no meio da conversa (homem no meio)',
    perigo: 3,
    descricao: 'Imita a voz do roteador para toda a sala. As mensagens passam por ele antes de seguir viagem, e ele decora tudo o que não estiver cifrado.',
    defesa: 'Inspeção dinâmica de ARP e port security no switch, segmentação, HTTPS e protocolos cifrados em tudo, e alerta quando o MAC do gateway muda de repente.',
  },
  {
    id: 'a2_gamba_gemeo',
    nome: 'Gambá Gêmeo',
    real: 'Evil twin: ponto de acesso Wi-Fi falso com o mesmo nome (SSID) de uma rede conhecida, para capturar tráfego e senhas',
    perigo: 4,
    descricao: 'Fica pendurado de cabeça para baixo num poste com uma placa igualzinha à da padaria. Sinal forte, rede aberta, simpatia total. Depois que você conecta, fede.',
    defesa: 'Desconfiar de rede aberta com nome conhecido, esquecer redes públicas salvas, preferir WPA3 ou WPA2 Enterprise, usar VPN em rede pública e nunca digitar senha em portal cativo estranho.',
  },
];

export const figurinhas2: Figurinha[] = [
  {
    id: 'a2_arpanet_lo',
    nome: 'A primeira mensagem da ARPANET',
    ano: '1969',
    texto: 'Em 29 de outubro de 1969, Charley Kline, na UCLA, tentou mandar "LOGIN" para o Stanford Research Institute. O sistema caiu depois do "LO". A primeira mensagem da internet foi um "LO" e um travamento, o que explica muita coisa.',
  },
  {
    id: 'a2_metcalfe',
    nome: 'Robert Metcalfe e a Ethernet',
    ano: '1973',
    texto: 'Em maio de 1973, no Xerox PARC, Metcalfe escreveu o memorando que descrevia a Ethernet. Depois fundou a 3Com e ganhou o Prêmio Turing em 2022. O cabo azul do seu dormitório é tataraneto daquele papel.',
  },
  {
    id: 'a2_cerf_kahn',
    nome: 'Vint Cerf e Bob Kahn',
    ano: '1974',
    texto: 'Publicaram em 1974 o artigo que deu origem ao TCP/IP. Em 1º de janeiro de 1983 a ARPANET trocou oficialmente para TCP/IP, num "dia da virada" sem volta. Ganharam o Prêmio Turing em 2004. Nenhuma reunião de alinhamento foi registrada.',
  },
  {
    id: 'a2_mockapetris',
    nome: 'Paul Mockapetris e o DNS',
    ano: '1983',
    texto: 'Criou o DNS, descrito nas RFCs 882 e 883 de 1983. Antes disso, a lista de nomes da rede era um único arquivo HOSTS.TXT que todo mundo baixava. Era o grupo da família com a lista de telefones fixada, só que pior.',
  },
  {
    id: 'a2_perlman',
    nome: 'Radia Perlman e o Spanning Tree',
    ano: '1985',
    texto: 'Na DEC, criou o Spanning Tree Protocol, que impede que laços de cabo entre switches derrubem a rede inteira com tempestade de broadcast. Escreveu até um poema sobre o algoritmo, chamado "Algorhyme".',
  },
  {
    id: 'a2_morris',
    nome: 'O Worm de Morris',
    ano: '1988',
    texto: 'Em 2 de novembro de 1988, um worm escrito por Robert Tappan Morris infectou cerca de 6 mil máquinas, perto de 10% da internet da época. Foi a primeira condenação pela lei americana de fraude de computador. Hoje ele é professor no MIT.',
  },
  {
    id: 'a2_lamarr',
    nome: 'Hedy Lamarr e o salto de frequência',
    ano: '1942',
    texto: 'Atriz de Hollywood e inventora, recebeu em agosto de 1942, com o compositor George Antheil, a patente de um sistema de salto de frequência para guiar torpedos. A ideia de espalhar o sinal por várias frequências é avó de tecnologias sem fio que você usa hoje.',
  },
  {
    id: 'a2_wannacry',
    nome: 'WannaCry',
    ano: '2017',
    texto: 'Em 12 de maio de 2017, o WannaCry se espalhou como worm pela porta 445 (SMBv1) e cifrou centenas de milhares de computadores em mais de 150 países. A correção MS17-010 tinha saído em março. A atualização estava lá, esperando o "lembrar mais tarde".',
  },
];

export const itens2: Item[] = [
  {
    id: 'a2_camiseta_ttl',
    nome: 'Camiseta "Meu TTL Zerou"',
    descricao: 'Camiseta preta com a frase "Meu TTL zerou, me descarta". Ideal para segunda-feira de manhã.',
  },
  {
    id: 'a2_mapa_tuneis',
    nome: 'Mapa dos Túneis da Rede Antiga',
    descricao: 'Mapa desenhado pela turma a lápis, com cada switch, salto e rato encontrado nos túneis. A Tati já passou para uma planilha com três abas.',
  },
  {
    id: 'a2_alicate',
    nome: 'Alicate de Crimpar de Estimação',
    descricao: 'Presente da Profa. Ruth. Crimpa cabo na norma T568B e, segundo ela, "não aceita desaforo de conector torto".',
  },
  {
    id: 'a2_poster_osi',
    nome: 'Pôster das Sete Camadas',
    descricao: 'Enfeite de dormitório: um bolo de sete andares com uma camada OSI em cada. A camada 8, escrita à mão no rodapé, é "o usuário".',
  },
  {
    id: 'a2_luminaria_link',
    nome: 'Luminária Pisca-Link',
    descricao: 'Enfeite de dormitório que pisca verde quando a rede do castelo está de pé e laranja quando alguém está baixando o jogo inteiro no Wi-Fi.',
  },
  {
    id: 'a2_mapa_mae',
    nome: 'Mapa de Rede da Mãe',
    descricao: 'Camada 2 da pasta NAO_ABRA: um mapa de rede desenhado à mão pela sua mãe, com a palavra "Apagão" escrita num dos nós e uma linha que leva a um "túnel 7" que não existe em mapa nenhum.',
  },
];

export const lugares2: Lugar[] = [
  {
    id: 'a2_tuneis',
    nome: 'Túneis da Rede Antiga',
    descricao: 'Túneis ferroviários de 1890 embaixo do castelo, com cabo de cobre pregado na parede de pedra e caixas de junção que zumbem no escuro.',
    ano: 2,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a2_f_ip_neigh',
        texto: 'A tabela ARP mostra um vizinho com MAC começando em 00:00:0C, um prefixo antiquíssimo. Atrás de uma pedra solta, um switch de ferro fundido com placa de 1987 ainda pisca.',
        efeito: { xp: 20, atributos: { redes: 1 } },
      },
      {
        feitico: 'a2_f_traceroute',
        texto: 'O traceroute para o refeitório passa por um salto chamado "caixa-dagua-1890". Alguém, há muito tempo, roteou a rede por dentro da caixa-d\'água. E funcionou.',
        efeito: { xp: 20, amizade: { seu_ze: 1 } },
      },
      {
        feitico: 'a2_f_ss',
        texto: 'Uma máquina esquecida numa reentrância escuta na porta 23, Telnet, sem senha. O banner diz: "Bem-vindo. Por favor, não conte para a Ruth." Você desliga e conta para a Ruth.',
        efeito: { xp: 25, atributos: { defesa: 1 }, amizade: { ruth: 1 } },
      },
    ],
  },
  {
    id: 'a2_casa_maquinas',
    nome: 'Casa de Máquinas do Funicular',
    descricao: 'Onde ficavam as máquinas a vapor que puxavam os trens serra acima por cabo de aço. Hoje puxa cabo de rede, que é mais leve e dá mais dor de cabeça.',
    ano: 2,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a2_f_ping',
        texto: 'Cada ping volta com um apito de locomotiva. O de TTL 64 é um apito curto; o de TTL 128, dois. A caldeira ensina sistema operacional pelo som.',
        efeito: { xp: 15, atributos: { redes: 1 } },
      },
      {
        feitico: 'a2_f_ip_route',
        texto: 'A tabela de rotas mostra uma rota velha para 10.18.0.0/16 "via patamar-3". Num caderno de manutenção de 1911, alguém anotou: "não apagar, a diretora usa".',
        efeito: { xp: 20, amizade: { iolanda: 1 } },
      },
    ],
  },
  {
    id: 'a2_sala_comutacao',
    nome: 'Sala de Comutação',
    descricao: 'A antiga central telefônica do castelo, com mesas de telefonista, plugues de latão e cabos de pano. A Profa. Ruth trabalhou numa sala igual a esta e fica emocionada.',
    ano: 2,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a2_f_nslookup',
        texto: 'O nslookup para "telefonista" responde com o IP de um gramofone. Ele toca uma gravação: "Número chamado não existe. Confira o registro A e tente novamente."',
        efeito: { xp: 15, atributos: { redes: 1 } },
      },
      {
        feitico: 'a2_f_dig',
        texto: 'Um registro TXT escondido no domínio da central diz: "Ruth, 1989: melhor turno da minha vida. Café ruim, colegas ótimos." A professora fica vermelha e finge que é alergia.',
        efeito: { xp: 20, amizade: { ruth: 2 } },
      },
      {
        feitico: 'a2_f_netstat',
        texto: 'O velho painel ainda mantém uma conexão ESTABLISHED desde 1998 com a Sala da Diretora. Ninguém tem coragem de derrubar.',
        efeito: { xp: 15, amizade: { iolanda: 1 } },
      },
    ],
  },
  {
    id: 'a2_torre_relogio',
    nome: 'Torre do Relógio',
    descricao: 'O relógio de ferro inglês que marca a hora da serra. O ponteiro grande serve de antena e o pequeno, de desculpa para atraso.',
    ano: 2,
    cena: 'torre',
    segredos: [
      {
        feitico: 'a2_f_nmcli',
        texto: 'Lá de cima aparecem 47 redes Wi-Fi. Uma se chama "NAO_CONECTA_AQUI_CAUA". O Cauã jura que não é sobre ele.',
        efeito: { xp: 15, amizade: { caua: 1 } },
      },
      {
        feitico: 'a2_f_nc',
        texto: 'Com `-u`, para falar UDP, a porta 123 do relógio responde: é o NTP, o servidor de hora do castelo. Está dois minutos adiantado de propósito, "para ninguém chegar atrasado na aula do Otávio".',
        efeito: { xp: 20, atributos: { sistemas: 1 } },
      },
      {
        feitico: 'a2_f_ufw',
        texto: 'O firewall da torre tem uma regra comentada: "liberado só para os pombos". A Pomba Edite passa pela regra com toda a dignidade.',
        efeito: { xp: 20, atributos: { defesa: 1 } },
      },
    ],
  },
];

export const personagens2: Personagem[] = [
  {
    id: 'a2_helio',
    nome: 'Hélio Brandão',
    papel: 'técnico da Conecta Serra Telecom, contratado pela Secretaria para "modernizar" o Wi-Fi do castelo',
    cor: '#f4a261',
    pele: '#e0ac69',
    cabelo: '#4a3b2a',
    estilo: 'curto',
    roupa: '#2a9d8f',
  },
  {
    id: 'a2_dandara',
    nome: 'Dandara Lopes',
    papel: 'capitã do time titular das Jararacas no Capturebol, quinto ano, nunca perdeu um duelo de pré-jogo',
    cor: '#b388eb',
    pele: '#6f4a2f',
    cabelo: '#1a1a1a',
    estilo: 'cacheado',
    roupa: '#2d6a4f',
  },
];
