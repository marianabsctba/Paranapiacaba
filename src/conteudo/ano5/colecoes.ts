import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

// Coleções do Ano 5: Plantão (Blue Team)

export const personagensAno5: Personagem[] = [
  {
    id: 'a5_rodrigo',
    nome: 'Rodrigo Valentim',
    papel: 'pai do Enzo, influencer de cripto que virou CEO da Segurança Garantida Ltda., fala em "jornada" até pedindo café',
    cor: '#d4af37',
    pele: '#f6e0d0',
    cabelo: '#6b4f3a',
    estilo: 'curto',
    roupa: '#0d1b2a',
  },
  {
    id: 'a5_kelly',
    nome: 'Kellyane Prates',
    papel: 'gerente de projetos da Segurança Garantida, faz slide com transição de cubo giratório',
    cor: '#ff8fab',
    pele: '#e0ac69',
    cabelo: '#3b1f0f',
    estilo: 'longo',
    oculos: true,
    roupa: '#c9184a',
  },
  {
    id: 'a5_thales',
    nome: 'Thales Bittencourt',
    papel: 'Head de Cyber Sinergia da Segurança Garantida, tem onze certificações e nenhum plantão',
    cor: '#7fb7be',
    pele: '#f1c27d',
    cabelo: '#222',
    estilo: 'barba',
    roupa: '#3d405b',
  },
  {
    id: 'a5_dora',
    nome: 'Dona Dora Matias',
    papel: 'controladora de tráfego ferroviário aposentada, guarda o galpão de manutenção e nunca dormiu num turno',
    cor: '#f6bd60',
    pele: '#8d5524',
    cabelo: '#d9d9d9',
    estilo: 'cacheado',
    oculos: true,
    roupa: '#355070',
  },
];

export const lugaresAno5: Lugar[] = [
  {
    id: 'a5_galpao',
    nome: 'Galpão de Manutenção (SOC clandestino)',
    descricao: 'Galpão dos trens antigos atrás do castelo. Agora tem seis monitores de doação, um painel de alertas e uma chaleira que apita quando o SIEM trava.',
    ano: 5,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a5_jornalis',
        texto: 'O journal da máquina velha do galpão mostra um serviço chamado `apito.service` que roda todo dia às 3h. Era a Dona Dora, testando se alguém estava acordado. Ela anota seu nome na lista de "gente que olha log".',
        efeito: { xp: 20, amizade: { a5_dora: 2 } },
      },
      {
        feitico: 'a5_correlatio',
        texto: 'Uma consulta de correlação nos logs antigos da ferrovia revela que, em 1974, o CCO detectou um trem fantasma porque dois sensores discordavam. Correlação já salvava vidas antes de ter nome bonito.',
        efeito: { xp: 25, atributos: { defesa: 1 } },
      },
      {
        feitico: 'a5_sigma',
        texto: 'Embaixo da bancada, colada com fita isolante (assinatura do Cauã), há uma regra Sigma escrita à mão pela Profa. Nanda: "title: aluno dormindo no plantão". O campo `level` diz `informational`.',
        efeito: { xp: 15, item: 'a5_moletom_plantao' },
      },
    ],
  },
  {
    id: 'a5_sala_sinergia',
    nome: 'Sala de Sinergia',
    descricao: 'Antiga sala de música, ocupada pela Segurança Garantida. Tem pufe, lousa de vidro, uma TV de 85 polegadas com um painel 100% verde e nenhum log ligado nele.',
    ano: 5,
    cena: 'sala',
    segredos: [
      {
        feitico: 'a5_quaestio',
        texto: 'Você consulta os eventos de segurança da máquina do painel: o último evento é de agosto. O painel não está verde porque está tudo bem. Está verde porque é uma imagem PNG.',
        efeito: { xp: 25, atributos: { forense: 1 } },
      },
      {
        feitico: 'a5_privilegium',
        texto: 'A conta `estagiario_slides` da consultoria pode rodar qualquer comando como root. Você anota no relatório paralelo da turma: "privilégio máximo para quem só precisava mudar a fonte do título".',
        efeito: { xp: 20, atributos: { defesa: 1 } },
      },
    ],
  },
  {
    id: 'a5_cabine_sinais',
    nome: 'Cabine de Sinalização',
    descricao: 'Torrinha de madeira na beira da linha, cheia de alavancas que controlavam os desvios. Quem trabalhava aqui fazia triagem de trem antes de existir triagem de alerta.',
    ano: 5,
    cena: 'torre',
    segredos: [
      {
        feitico: 'a5_suricatus',
        texto: 'O sensor de rede escondido na cabine dispara um alerta: alguém da vila está tentando acessar o Wi-Fi do castelo com a senha `paranapiacaba123`. É o padeiro. Ele só queria ver a novela.',
        efeito: { xp: 20, atributos: { redes: 1 } },
      },
      {
        feitico: 'a5_murus',
        texto: 'Atrás de uma alavanca há um caderno da Dona Dora: "regra de ouro: na dúvida, bloqueia o desvio e chama o supervisor". Contenção antes de existir NIST.',
        efeito: { xp: 20, figurinha: 'a5_fig_cert_br' },
      },
      {
        feitico: 'a5_vulnerabilis',
        texto: 'Um varredor de vulnerabilidade aponta que o rádio da cabine roda um firmware de 2009 com CVE pública. O rádio também toca forró. Você registra as duas coisas.',
        efeito: { xp: 25, atributos: { ofensiva: 1 } },
      },
    ],
  },
  {
    id: 'a5_rotunda',
    nome: 'Rotunda das Locomotivas',
    descricao: 'Galpão circular com uma plataforma giratória no centro. As locomotivas velhas dormem em raios, como processos numa árvore.',
    ano: 5,
    cena: 'castelo',
    segredos: [
      {
        feitico: 'a5_arbor',
        texto: 'A árvore de processos da maquininha da rotunda mostra um `cron` que chama um `python3` que chama um `curl`. É o Seu Zé baixando a previsão do tempo para saber se vai ter neblina. Benigno, mas agora documentado.',
        efeito: { xp: 20, amizade: { seu_ze: 2 } },
      },
      {
        feitico: 'a5_bitum',
        texto: 'Um binário com SUID em `/opt/locomotiva/apito` roda como root e aceita qualquer argumento. Você avisa o Seu Zé, ele tira o bit e agradece com uma paçoca do estoque secreto.',
        efeito: { xp: 25, item: 'a5_pacoca_root' },
      },
      {
        feitico: 'a5_auditorium',
        texto: 'A auditoria de hardening da máquina da rotunda dá índice 41. A Bia lê o relatório e diz que é a nota mais honesta que já viu na vida.',
        efeito: { xp: 15, amizade: { bia: 1 } },
      },
    ],
  },
];

export const feiticosAno5: Feitico[] = [
  {
    id: 'a5_jornalis',
    nome: 'Jornalis Servitii',
    comando: 'journalctl -u ssh --since "1 hour ago"',
    descricao: 'Lê o diário do systemd de um serviço só, a partir de um horário. É como ler o grupo da família filtrando só a tia que manda corrente.',
  },
  {
    id: 'a5_quaestio',
    nome: 'Quaestio Eventorum',
    comando: 'Get-WinEvent -LogName Security -FilterXPath "*[System[EventID=4625]]"',
    descricao: 'Pergunta ao Visualizador de Eventos do Windows só pelos logons que falharam. Sem clicar em vinte pastinhas.',
  },
  {
    id: 'a5_correlatio',
    nome: 'Correlatio Contabilis',
    comando: 'index=auth action=failure | stats count by src_ip | where count > 20',
    descricao: 'Consulta de SIEM no estilo SPL que conta falhas de login por IP de origem e mostra só quem passou de 20. Contar é o começo de toda desconfiança.',
  },
  {
    id: 'a5_kustoso',
    nome: 'Kustoso Summarium',
    comando: 'SecurityEvent | where EventID == 4625 | summarize falhas = count() by IpAddress',
    descricao: 'A mesma ideia em KQL: filtra o evento 4625 e resume por IP. Feitiço bilíngue, para quem trabalha em dois SIEMs e chora em ambos.',
  },
  {
    id: 'a5_sigma',
    nome: 'Sigma Convertio',
    comando: 'sigma convert -t splunk -p sysmon regra.yml',
    descricao: 'Converte uma regra Sigma (YAML genérico) na consulta do SIEM que você usa. Escreve uma vez, detecta em qualquer lugar. Quase igual Java, só que funciona.',
  },
  {
    id: 'a5_suricatus',
    nome: 'Suricatus Probatio',
    comando: 'suricata -T -c /etc/suricata/suricata.yaml',
    descricao: 'Testa a configuração e as regras do Suricata antes de colocar no ar. Porque derrubar o IDS com uma vírgula errada é vergonha de plantão.',
  },
  {
    id: 'a5_arbor',
    nome: 'Arbor Processuum',
    comando: 'ps -ef --forest',
    descricao: 'Mostra os processos como árvore, com pai e filho. Quando o editor de texto tem um filho shell, alguém precisa de uma conversa séria.',
  },
  {
    id: 'a5_auditus',
    nome: 'Auditus Inquisitio',
    comando: 'ausearch -k identidade -i',
    descricao: 'Busca no log do auditd os eventos marcados com uma chave (aqui, quem mexeu em arquivos de identidade) e traduz números em nomes.',
  },
  {
    id: 'a5_murus',
    nome: 'Murus Ignis Repentinus',
    comando: 'iptables -I INPUT -s 203.0.113.7 -j DROP',
    descricao: 'Insere no topo da cadeia INPUT uma regra que descarta tudo vindo de um IP. Contenção de curto prazo: o cadeado na porta enquanto você pensa.',
  },
  {
    id: 'a5_clausura',
    nome: 'Clausura Contae',
    comando: 'usermod -L -e 1 svc_relatorio',
    descricao: 'Trava a senha E expira a conta. Só o `-L` não segura quem entra por chave SSH, e invasor adora uma chave SSH.',
  },
  {
    id: 'a5_auditorium',
    nome: 'Auditorium Durissimum',
    comando: 'lynis audit system',
    descricao: 'Auditoria de hardening do Linux: dá índice, lista avisos e sugestões. É o check-up do sistema, e o sistema sempre está com colesterol alto.',
  },
  {
    id: 'a5_silentium',
    nome: 'Silentium Servitii',
    comando: 'systemctl disable --now avahi-daemon',
    descricao: 'Para um serviço agora e impede que ele volte no boot. Serviço que ninguém usa é porta aberta que ninguém vigia.',
  },
  {
    id: 'a5_privilegium',
    nome: 'Privilegium Minimus',
    comando: 'sudo -l',
    descricao: 'Lista o que o seu usuário pode rodar com sudo. Se a resposta for "(ALL) ALL" para a conta do estagiário de slides, temos um problema.',
  },
  {
    id: 'a5_bitum',
    nome: 'Bitum Periculosum',
    comando: 'find / -perm -4000 -type f 2>/dev/null',
    descricao: 'Procura arquivos com o bit SUID, que rodam com o poder do dono (quase sempre root). Toda lista dessas tem um item que ninguém sabe explicar.',
  },
  {
    id: 'a5_vulnerabilis',
    nome: 'Vulnerabilis Scrutinium',
    comando: 'nmap -sV --script vulners 10.5.0.20',
    descricao: 'Descobre versões dos serviços e cruza com CVEs conhecidas. Só em rede sua ou com autorização por escrito, que nmap sem contrato é visita sem convite.',
  },
  {
    id: 'a5_oraculum',
    nome: 'Oraculum NVD',
    comando: 'curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2021-44228"',
    descricao: 'Pergunta à base pública do NIST tudo sobre uma CVE: descrição, CVSS, referências. O oráculo responde em JSON, porque oráculo moderno não fala em verso.',
  },
];

export const criaturasAno5: Criatura[] = [
  {
    id: 'a5_vagalume',
    nome: 'Vaga-lume Sinaleiro',
    real: 'Beacon de comando e controle (C2): o implante "liga para casa" em intervalos regulares por HTTPS ou DNS (ATT&CK T1071).',
    perigo: 4,
    descricao: 'Pisca no escuro da rede a cada 60 segundos, com um tremidinho (jitter) para disfarçar. Sozinho parece inofensivo. Em bando, é uma botnet.',
    defesa: 'Procurar periodicidade nos logs de proxy, firewall e DNS (mesmo destino, intervalos quase iguais), bloquear saída por padrão (egress filtering), usar proxy com inspeção e reputação de domínio, e isolar o host achado pelo EDR.',
  },
  {
    id: 'a5_sagui',
    nome: 'Sagui das Contas Válidas',
    real: 'Uso de credenciais legítimas roubadas ou compradas para entrar como se fosse funcionário (ATT&CK T1078), muitas vezes por VPN ou acesso remoto (T1133).',
    perigo: 5,
    descricao: 'Pequeno, simpático e com crachá. Nenhum antivírus late, porque ele tem a senha certa. Adora conta de fornecedor esquecida.',
    defesa: 'MFA em todo acesso remoto, inventário e expiração de contas de terceiros, alertas de viagem impossível e horário atípico, revisão periódica de acessos e monitoramento de logons remotos (4624 tipo 10 no Windows, sshd no Linux).',
  },
  {
    id: 'a5_cupim',
    nome: 'Cupim Binário-da-Casa',
    real: 'Living off the land: o atacante usa ferramentas legítimas do próprio sistema (PowerShell, certutil, rundll32, wmic) para não precisar trazer malware (ATT&CK T1059, T1218).',
    perigo: 4,
    descricao: 'Come a casa por dentro usando a madeira da própria casa. O antivírus olha, vê `powershell.exe` assinado pela Microsoft e volta a dormir.',
    defesa: 'Registrar linha de comando (evento 4688 com auditoria de linha de comando, Sysmon evento 1), EDR com análise de comportamento, regras para `-EncodedCommand` e para pais estranhos, AppLocker ou WDAC e logging de script block do PowerShell (evento 4104).',
  },
  {
    id: 'a5_jiboia',
    nome: 'Jiboia Web-shell',
    real: 'Web shell: um script plantado no servidor web que executa comandos pelo navegador (ATT&CK T1505.003), geralmente depois de explorar a aplicação (T1190).',
    perigo: 4,
    descricao: 'Enrola no servidor e fica quietinha dentro da pasta de uploads, com nome de `imagem.php`. Só se mexe quando alguém chama pelo nome certo.',
    defesa: 'Proibir execução em pastas de upload, monitorar integridade de arquivos (FIM) no diretório web, alertar quando o processo do servidor web (apache, nginx, w3wp) gera shell, corrigir a falha de entrada e revisar logs de acesso por POSTs raros.',
  },
  {
    id: 'a5_preguica',
    nome: 'Preguiça Exfiltradora',
    real: 'Exfiltração lenta por tunelamento DNS: dados picados dentro de nomes de domínio enormes (ATT&CK T1048 e T1071.004).',
    perigo: 3,
    descricao: 'Leva um arquivo de cada vez, um pedacinho por consulta DNS, sem pressa nenhuma. Em seis meses, levou a biblioteca inteira e ninguém viu.',
    defesa: 'Forçar todo DNS pelo resolvedor interno e bloquear a porta 53 direto para fora, registrar as consultas, alertar sobre nomes longos e com alta entropia, e volume anormal de consultas para um mesmo domínio.',
  },
  {
    id: 'a5_tatu',
    nome: 'Tatu Minerador',
    real: 'Criptominerador clandestino: usa a CPU de servidores invadidos para minerar criptomoeda (ATT&CK T1496, Resource Hijacking).',
    perigo: 2,
    descricao: 'Cava sem parar. O servidor esquenta, a conta de luz sobe e o Seu Zé jura que o nobreak está assombrado.',
    defesa: 'Monitorar uso de CPU fora do padrão, bloquear conexões para pools de mineração conhecidos, procurar processos com nomes falsos e persistência em cron, e corrigir a vulnerabilidade usada na entrada.',
  },
];

export const figurinhasAno5: Figurinha[] = [
  {
    id: 'a5_fig_stoll',
    nome: 'Cliff Stoll e os 75 centavos',
    ano: '1986',
    texto: 'Astrônomo no Lawrence Berkeley Laboratory, Cliff Stoll achou uma diferença de 75 centavos na contabilidade dos computadores e puxou o fio até um espião que vendia dados para a KGB. Contou tudo no livro "The Cuckoo\'s Egg" (1989). Nunca subestime um analista que confere troco.',
  },
  {
    id: 'a5_fig_denning',
    nome: 'Dorothy Denning e o modelo de IDS',
    ano: '1987',
    texto: 'Dorothy Denning publicou "An Intrusion-Detection Model" na IEEE Transactions on Software Engineering, propondo detectar invasões por comportamento anômalo em registros de auditoria. A base de quase todo IDS que veio depois. E sem slide de cubo giratório.',
  },
  {
    id: 'a5_fig_cert_cc',
    nome: 'Nasce o CERT/CC',
    ano: '1988',
    texto: 'Depois do worm Morris derrubar parte da internet em novembro de 1988, a DARPA financiou a criação do CERT Coordination Center na Carnegie Mellon University. Foi o primeiro time de resposta a incidentes desse tipo. Nasceu de um incidente, como todo bom SOC.',
  },
  {
    id: 'a5_fig_cert_br',
    nome: 'CERT.br, o plantão do Brasil',
    ano: '1997',
    texto: 'O grupo de resposta a incidentes da internet brasileira surgiu em 1997 como NBSO, ligado ao Comitê Gestor da Internet, e depois virou CERT.br, mantido pelo NIC.br. Recebe notificações de incidentes de redes brasileiras e publica cartilhas de segurança gratuitas.',
  },
  {
    id: 'a5_fig_snort',
    nome: 'Martin Roesch e o Snort',
    ano: '1998',
    texto: 'Martin Roesch lançou o Snort em 1998, um IDS de rede leve e de código aberto, com regras que qualquer pessoa podia escrever. A sintaxe de regra dele influenciou o Suricata e virou dialeto universal de quem olha pacote.',
  },
  {
    id: 'a5_fig_cve',
    nome: 'A lista CVE',
    ano: '1999',
    texto: 'Em 1999 a MITRE lançou a lista CVE (Common Vulnerabilities and Exposures) com 321 entradas, para todo mundo chamar a mesma falha pelo mesmo nome. Antes disso, cada fornecedor batizava o bug do seu jeito, igual apelido de grupo de família.',
  },
  {
    id: 'a5_fig_nist',
    nome: 'NIST SP 800-61',
    ano: '2004',
    texto: 'O NIST publicou em 2004 o guia SP 800-61 de tratamento de incidentes. A revisão 2 (2012) consagrou o ciclo preparação, detecção e análise, contenção/erradicação/recuperação e pós-incidente. A revisão 3 (2025) reorganizou tudo em torno das funções do CSF 2.0.',
  },
  {
    id: 'a5_fig_attck',
    nome: 'MITRE ATT&CK vai a público',
    ano: '2015',
    texto: 'A MITRE começou o ATT&CK em 2013, num projeto interno que emulava adversários numa rede de pesquisa, e publicou a base em 2015. Hoje é o vocabulário comum entre Red e Blue Team. T1078 é a mesma coisa em São Paulo e em Seul.',
  },
];

export const itensAno5: Item[] = [
  {
    id: 'a5_cracha_plantao',
    nome: 'Crachá de Plantonista',
    descricao: 'Crachá feito pela Tati no laminador da Secretaria (sem autorização). Diz "N1 em treinamento, N3 em ansiedade". Dá acesso ao galpão e a café ilimitado.',
  },
  {
    id: 'a5_moletom_plantao',
    nome: 'Moletom "Sobrevivi ao Plantão das 3h"',
    descricao: 'Moletom cinza com capuz e bolso para dois carregadores. Nas costas, em letra de cordel do Jonas: "o alerta não dorme, então eu também não".',
  },
  {
    id: 'a5_poster_attck',
    nome: 'Pôster da Matriz ATT&CK',
    descricao: 'Enfeite de dormitório: a matriz inteira, colada na parede do lado do beliche. Você marca com adesivo de estrelinha cada técnica que já detectou.',
  },
  {
    id: 'a5_slide_emoldurado',
    nome: 'Slide Emoldurado "Risco: Baixo"',
    descricao: 'Enfeite de dormitório. O slide da Segurança Garantida que dizia "Risco: Baixo" na semana da invasão, numa moldura dourada. Ótimo para lembrar que painel verde não é segurança.',
  },
  {
    id: 'a5_pacoca_root',
    nome: 'Paçoca do Nobreak',
    descricao: 'Uma paçoca do estoque secreto do Seu Zé. Recompensa por achar um SUID perigoso. Tem privilégio de root na sua alegria.',
  },
  {
    id: 'a5_gravacao_lena',
    nome: 'Gravação da Camada 5',
    descricao: 'Arquivo de áudio da pasta NAO_ABRA, decifrado no fim do Ano 5. A voz da sua mãe, Lena, gravada depois do Apagão: ela está viva, está escondida e pede que você continue aprendendo.',
  },
];
