import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

// Coleções do Ano 7: O Grande Apagão (Active Directory e resposta a incidente completa)

export const personagensAno7: Personagem[] = [
  {
    id: 'a7_lena',
    nome: 'Lena',
    papel: 'Mãe, especialista em resposta a incidentes, onze anos escondida no Vale do Ribeira rastreando o Nulo, chama você de bem-te-vi',
    cor: '#dca9d5',
    pele: '#b87953',
    cabelo: '#302019',
    estilo: 'cacheado',
    roupa: '#503b73',
  },
  {
    id: 'a7_rui',
    nome: 'Rui',
    papel: 'Pai, investigador e perito, resgatado vivo de uma instalação do Nulo, onde deixou rastros de propósito por onze anos',
    cor: '#8bb5cb',
    pele: '#99623c',
    cabelo: '#211912',
    estilo: 'barba',
    roupa: '#29485c',
  },
  {
    id: 'a7_sonia',
    nome: 'Delegada Sônia Albuquerque',
    papel: 'delegada de crimes cibernéticos da Secretaria, perita de formação, a única pessoa de Brasília que lê o anexo',
    cor: '#f4a261',
    pele: '#6f4e37',
    cabelo: '#1b1b1b',
    estilo: 'curto',
    oculos: true,
    roupa: '#264653',
  },
  {
    id: 'a7_bemtevi',
    nome: 'Bem-te-vi',
    papel: 'pássaro que mora na Oficina e grita "bem-te-vi" toda vez que alguém mexe no quadro de investigação',
    cor: '#ffd60a',
    pele: '#ffd60a',
    cabelo: '#3d2b1f',
    estilo: 'bicho',
    roupa: '#ffd60a',
  },
];

export const lugaresAno7: Lugar[] = [
  {
    id: 'a7_centro_crise',
    nome: 'Centro de Crise da Torre',
    descricao: 'O último andar da Torre das Antenas virou sala de guerra: uma parede inteira de telas com o mapa das escolas, mesas com monitores, carteiras do 1º ano trazidas na marra e um quadro "fato x hipótese" que ninguém apaga.',
    ano: 7,
    cena: 'torre',
    segredos: [
      {
        feitico: 'a7_nltest',
        texto: 'Você roda Dominus Custodes no console da parede. Na lista de controladores aparece um nome riscado a caneta no monitor: "DC-TREM-1998". O Seu Zé jura que esse servidor é uma locomotiva. Ninguém tem coragem de desmentir.',
        efeito: { xp: 20, amizade: { seu_ze: 2 } },
      },
      {
        feitico: 'a7_klist',
        texto: 'Tessera Monstrum mostra os tíquetes do console da Nanda. Um deles se chama "cafe/balde.paranapiacaba". Ela jura que é um serviço legítimo. É.',
        efeito: { xp: 15, amizade: { nanda: 1 } },
      },
    ],
  },
  {
    id: 'a7_oficina',
    nome: 'Oficina do Bem-te-vi',
    descricao: 'Casa de pau a pique escondida na mata do Vale do Ribeira, com placa solar, rádio amador e uma bancada de ferro. Na parede, o quadro de investigação de onze anos: fotos, logs impressos e barbante vermelho ligando tudo ao Nulo.',
    ano: 7,
    cena: 'casa',
    segredos: [
      {
        feitico: 'a7_get_winevent',
        texto: 'Eventus Fenestrae no notebook velho da bancada revela um log de 2015 com um único evento 4624 marcado à mão: "Rui entrou aqui às 23h50 e não saiu". Embaixo, com outra letra: "ele vai voltar".',
        efeito: { xp: 40, atributos: { forense: 1 }, flag: 'a7_segredo_oficina_log' },
      },
      {
        feitico: 'a7_crontab',
        texto: 'Horarium Linuxis no servidorzinho solar mostra uma tarefa às 5h da manhã: `tocar_bemtevi.sh`. Toda manhã, por onze anos, a casa tocou uma gravação sua gritando de pijama. Lena nunca desligou.',
        efeito: { xp: 30, amizade: { a7_lena: 3 } },
      },
    ],
  },
  {
    id: 'a7_cofre_backup',
    nome: 'Cofre de Backup Offline',
    descricao: 'Antiga caixa-forte da ferrovia, embaixo do Data Center, onde fitas e discos ficam desligados da rede. Só abre com duas chaves físicas: uma com o Seu Zé, outra com a Diretora. A Tati chama de "santuário do 3-2-1".',
    ano: 7,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a7_wbadmin',
        texto: 'Exemplaria Antiqua lista as versões de backup do cofre. A mais antiga é de 2009 e se chama "nao_apagar_tem_foto_da_festa_junina". Ninguém apaga.',
        efeito: { xp: 20, atributos: { sistemas: 1 } },
      },
      {
        feitico: 'a7_get_filehash',
        texto: 'Digitus Probationis numa fita lacrada confirma o hash anotado em 2015 com a letra da sua mãe. Bate. Onze anos depois, a evidência continua íntegra. A Tati chora um pouquinho.',
        efeito: { xp: 30, atributos: { forense: 1 }, amizade: { tati: 2 } },
      },
    ],
  },
  {
    id: 'a7_instalacao',
    nome: 'Frigorífico Serra Fria',
    descricao: 'Frigorífico abandonado na baixada, perto de Cubatão, que o Nulo transformou em data center clandestino: racks no lugar das carnes, ar gelado de graça e um cadeado novo numa porta de 1970.',
    ano: 7,
    cena: 'masmorra',
    segredos: [
      {
        feitico: 'a7_schtasks',
        texto: 'Horologium Revelatum num servidor apreendido mostra uma tarefa criada pelo seu pai, escondida entre as do Nulo: "copia_logs_para_ninguem". Copiava todos os logs para um disco que o Nulo nunca olhou. Seu pai fez backup do crime.',
        efeito: { xp: 40, atributos: { forense: 2 }, amizade: { a7_rui: 2 } },
      },
    ],
  },
];

export const feiticosAno7: Feitico[] = [
  {
    id: 'a7_nltest',
    nome: 'Dominus Custodes',
    comando: 'nltest /dclist:paranapiacaba',
    descricao: 'Lista os controladores de domínio de um domínio. É a chamada da sala, só que dos servidores que guardam todas as senhas. Se aparecer um que você não conhece, a aula acabou e o incidente começou.',
  },
  {
    id: 'a7_get_aduser',
    nome: 'Persona Directorii',
    comando: 'Get-ADUser -Identity tati -Properties MemberOf,LastLogonDate',
    descricao: 'Mostra a ficha de uma conta no Active Directory: nome, se está ativa, de que grupos faz parte e quando entrou por último. É o RH do domínio, só que responde na hora.',
  },
  {
    id: 'a7_whoami_groups',
    nome: 'Quis Sum Gregis',
    comando: 'whoami /groups',
    descricao: 'Mostra todos os grupos do seu próprio token de acesso, inclusive os herdados por grupo dentro de grupo. Quem roda e descobre que é Domain Admin sem saber precisa sentar e respirar.',
  },
  {
    id: 'a7_gpresult',
    nome: 'Politica Resultans',
    comando: 'gpresult /r',
    descricao: 'Diz quais políticas de grupo (GPOs) realmente se aplicaram à máquina e ao usuário, e quais foram filtradas. A diferença entre o que a TI acha que configurou e o que de fato chegou.',
  },
  {
    id: 'a7_klist',
    nome: 'Tessera Monstrum',
    comando: 'klist',
    descricao: 'Lista os tíquetes Kerberos guardados na sua sessão: o TGT e os tíquetes de serviço, com validade e tipo de cifra. A carteira de ingressos do domínio.',
  },
  {
    id: 'a7_get_winevent',
    nome: 'Eventus Fenestrae',
    comando: 'Get-WinEvent -LogName Security -MaxEvents 50 | Where-Object Id -eq 4624',
    descricao: 'Lê eventos do Log de Segurança do Windows e filtra pelo número. 4624, 4625, 4768, 4769: o diário do domínio, escrito por quem não sabe mentir.',
  },
  {
    id: 'a7_setspn',
    nome: 'Nomen Servitii',
    comando: 'setspn -L svc_biblioteca',
    descricao: 'Lista os nomes de serviço (SPNs) registrados numa conta. Inventário obrigatório: toda conta com SPN é conta de serviço, e toda conta de serviço precisa de senha enorme ou de gMSA.',
  },
  {
    id: 'a7_get_adgroupmember',
    nome: 'Grex Potentium',
    comando: 'Get-ADGroupMember -Identity "Domain Admins" -Recursive',
    descricao: 'Lista quem está, direta ou indiretamente, num grupo. Rodado no Domain Admins, costuma revelar a estagiária de 2017, a conta de teste e o fornecedor que ninguém lembra.',
  },
  {
    id: 'a7_reg_query',
    nome: 'Radix Inicii',
    comando: 'reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
    descricao: 'Lê a chave Run do Registro, onde moram os programas que iniciam com o Windows. Lugar favorito de persistência, junto com o atualizador de impressora que ninguém pediu.',
  },
  {
    id: 'a7_schtasks',
    nome: 'Horologium Revelatum',
    comando: 'schtasks /query /fo LIST /v',
    descricao: 'Lista todas as tarefas agendadas com detalhes: o que roda, quando, com que conta. Tarefa chamada "UpdateChecker" rodando PowerShell como SYSTEM às 3h da manhã merece conversa.',
  },
  {
    id: 'a7_cim_wmi',
    nome: 'Speculum Subscriptionis',
    comando: 'Get-CimInstance -Namespace root/subscription -ClassName __EventFilter',
    descricao: 'Mostra os filtros de assinatura de evento WMI, a persistência mais discreta do Windows. Se aparecer filtro que você não criou, procure o consumidor e a ligação entre os dois.',
  },
  {
    id: 'a7_crontab',
    nome: 'Horarium Linuxis',
    comando: 'crontab -l',
    descricao: 'Lista as tarefas agendadas do usuário no Linux. Cinco campos de horário e um comando. Linha baixando script da internet a cada minuto não é rotina, é inquilino.',
  },
  {
    id: 'a7_disable_ad',
    nome: 'Clausura Personae',
    comando: 'Disable-ADAccount -Identity svc_impressora',
    descricao: 'Desativa uma conta do Active Directory sem apagar. Conta desativada guarda evidência, grupos e histórico; conta apagada vira mistério. Na contenção, desative.',
  },
  {
    id: 'a7_repadmin',
    nome: 'Replicatio Summa',
    comando: 'repadmin /replsummary',
    descricao: 'Mostra um resumo da replicação entre controladores de domínio, com falhas e atrasos. Antes do segundo reset da krbtgt, todo mundo olha para esta tela rezando.',
  },
  {
    id: 'a7_wbadmin',
    nome: 'Exemplaria Antiqua',
    comando: 'wbadmin get versions',
    descricao: 'Lista as versões de backup do Windows Server disponíveis para restauração, com data e hora. A máquina do tempo, desde que alguém tenha testado se ela liga.',
  },
  {
    id: 'a7_get_filehash',
    nome: 'Digitus Probationis',
    comando: 'Get-FileHash evidencia.evtx -Algorithm SHA256',
    descricao: 'Calcula o SHA-256 de um arquivo no PowerShell. Primeira coisa que se faz com evidência, antes do café. Depois do café também, para conferir.',
  },
];

export const criaturasAno7: Criatura[] = [
  {
    id: 'a7_erva_passarinho',
    nome: 'Erva-de-Passarinho de GPO',
    real: 'GPO maliciosa ou alterada: uma política de grupo usada para espalhar configuração, script ou programa para muitas máquinas de uma vez',
    perigo: 5,
    descricao: 'Planta parasita que gruda num galho e se espalha pela árvore inteira. Uma política alterada num único lugar chega a todas as máquinas da OU no próximo ciclo de atualização, com a bênção do próprio domínio.',
    defesa: 'Auditar mudanças em GPO (evento 5136 com auditoria de serviço de diretório), restringir quem edita política, revisar vínculos e permissões periodicamente e manter backup das GPOs para comparar.',
  },
  {
    id: 'a7_carrapato_hash',
    nome: 'Carrapato de Hash',
    real: 'Pass-the-hash: reutilizar o hash NTLM de uma senha, roubado da memória de uma máquina, para autenticar sem saber a senha',
    perigo: 4,
    descricao: 'Não precisa da sua senha, só do que sobrou dela na memória. Gruda numa estação onde um administrador entrou e pula de máquina em máquina pela mesma credencial.',
    defesa: 'Camadas administrativas (admin de servidor nunca entra em estação), LAPS para senhas locais únicas, grupo Protected Users, Credential Guard, reduzir NTLM e caçar 4624 tipo 3 com NTLM vindo de origem incomum.',
  },
  {
    id: 'a7_pipoqueiro',
    nome: 'Pipoqueiro de Serviço',
    real: 'Kerberoasting: pedir tíquetes de serviço de contas com SPN e tentar adivinhar offline a senha da conta de serviço',
    perigo: 4,
    descricao: 'Pede um saco de tíquete de cada carrinho do domínio, que entrega para qualquer usuário, e leva para casa para estourar no micro-ondas da força bruta. Senha curta de conta de serviço vira pipoca.',
    defesa: 'gMSA ou senhas de 25 caracteres ou mais nas contas de serviço, só AES (desligar RC4), menor privilégio para contas de serviço, alerta para rajadas de 4769 com cifra 0x17 e conta-isca com SPN.',
  },
  {
    id: 'a7_coruja_dourada',
    nome: 'Coruja do Tíquete Dourado',
    real: 'Golden Ticket: TGT forjado com a chave da conta krbtgt, que dá ao atacante acesso como qualquer usuário do domínio',
    perigo: 5,
    descricao: 'Só aparece depois que o domínio já caiu, porque precisa da chave da krbtgt. Aí imprime o próprio ingresso, com o nome que quiser e a validade que quiser. É a coruja que voa de dia porque ninguém mais manda nela.',
    defesa: 'Proteger o Tier 0 como cofre, alertar para replicação de diretório pedida por quem não é DC (4662), procurar 4769 sem 4768 correspondente e, na resposta, redefinir a senha da krbtgt duas vezes com intervalo.',
  },
  {
    id: 'a7_tiririca_registro',
    nome: 'Tiririca de Registro',
    real: 'Persistência por chave Run ou RunOnce do Registro do Windows, que executa um programa a cada logon ou inicialização',
    perigo: 3,
    descricao: 'Você arranca e ela volta. Fica numa chave do Registro que o Windows obedece a cada logon, quase sempre com nome de atualizador. Mais teimosa que tia mandando bom dia.',
    defesa: 'Revisar chaves Run e RunOnce (HKLM e HKCU) com Autoruns ou reg query, Sysmon com evento 13 para gravação no Registro, bloquear execução em pastas de usuário e comparar com uma linha de base limpa.',
  },
  {
    id: 'a7_cuco_agendado',
    nome: 'Cuco Agendado',
    real: 'Persistência por tarefa agendada ou serviço do Windows (e por cron no Linux), que roda código em horário marcado ou a cada inicialização',
    perigo: 4,
    descricao: 'Sai do relógio na hora certa, faz o serviço sujo e volta para dentro. Gosta das 3h da manhã e de nomes como "GoogleUpdateTaskMachineCore2". O 2 é o que entrega.',
    defesa: 'Alertar em 4698 (tarefa criada), 4697 e 7045 (serviço instalado), revisar tarefas com schtasks e serviços com sc qc, conferir caminho e assinatura do binário e revisar crontab e timers do systemd.',
  },
  {
    id: 'a7_aranha_wmi',
    nome: 'Aranha de Assinatura',
    real: 'Persistência por assinatura de evento WMI: um filtro, um consumidor e uma ligação que executam algo quando um evento acontece',
    perigo: 4,
    descricao: 'Tece três fios quase invisíveis: o filtro espera, o consumidor age, a ligação une os dois. Não tem arquivo na pasta Inicializar nem tarefa no agendador. Mora no repositório do WMI e espera o sinal.',
    defesa: 'Monitorar o evento 5861 do log WMI-Activity, Sysmon com eventos 19, 20 e 21, listar __EventFilter, __EventConsumer e __FilterToConsumerBinding em root/subscription e incluir isso no hunting.',
  },
];

export const figurinhasAno7: Figurinha[] = [
  {
    id: 'a7_fig_needham_schroeder',
    nome: 'Protocolo Needham-Schroeder',
    ano: '1978',
    texto: 'Roger Needham e Michael Schroeder publicaram um protocolo de autenticação com um terceiro confiável distribuindo chaves. É a base do Kerberos. Anos depois acharam uma falha numa das versões, e a correção virou lição eterna: até protocolo famoso tem bug.',
  },
  {
    id: 'a7_fig_kerberos',
    nome: 'Kerberos, Projeto Athena',
    ano: '1988',
    texto: 'Criado no Projeto Athena do MIT, o Kerberos ganhou o nome do cão de três cabeças que guarda o mundo dos mortos: cliente, servidor e central de chaves. A versão 5 virou a RFC 1510 em 1993, atualizada pela RFC 4120 em 2005. O cachorro continua trabalhando.',
  },
  {
    id: 'a7_fig_active_directory',
    nome: 'Active Directory',
    ano: '2000',
    texto: 'Chegou com o Windows 2000 Server, em fevereiro de 2000, e virou o jeito padrão de empresas gerenciarem usuários, grupos e computadores. Mais de 25 anos depois, quase todo grande incidente ainda passa por ele. Parabéns e sinto muito.',
  },
  {
    id: 'a7_fig_marco_civil',
    nome: 'Marco Civil da Internet',
    ano: '2014',
    texto: 'A Lei 12.965, de 23 de abril de 2014, estabeleceu direitos e deveres no uso da internet no Brasil, incluindo a guarda de registros de conexão por um ano e de acesso a aplicações por seis meses. Perícia agradece; o grupo da família nem ficou sabendo.',
  },
  {
    id: 'a7_fig_notpetya',
    nome: 'NotPetya',
    ano: '2017',
    texto: 'Em 27 de junho de 2017, um malware entregue pela atualização de um software de contabilidade ucraniano se espalhou pelas redes de empresas no mundo todo, roubando credenciais e destruindo dados. Parecia ransomware, mas não tinha como devolver nada. Foi um wiper de fantasia.',
  },
  {
    id: 'a7_fig_lgpd',
    nome: 'LGPD',
    ano: '2018',
    texto: 'A Lei Geral de Proteção de Dados (Lei 13.709) foi sancionada em 14 de agosto de 2018 e entrou em vigor em setembro de 2020; as sanções começaram a valer em agosto de 2021. Desde então, "o estagiário vazou a planilha" virou assunto jurídico.',
  },
  {
    id: 'a7_fig_colonial',
    nome: 'Colonial Pipeline',
    ano: '2021',
    texto: 'Em maio de 2021, um ransomware parou o maior oleoduto de combustíveis da costa leste dos Estados Unidos por dias. Segundo o próprio presidente da empresa, a entrada foi uma conta antiga de VPN sem MFA. Uma senha, um país em fila no posto.',
  },
  {
    id: 'a7_fig_anpd',
    nome: 'ANPD',
    ano: '2024',
    texto: 'A Autoridade Nacional de Proteção de Dados publicou em abril de 2024 a Resolução CD/ANPD nº 15, o regulamento de comunicação de incidente: aviso à ANPD e aos titulares em até três dias úteis quando houver risco ou dano relevante. Três dias úteis, não três reuniões.',
  },
];

export const itensAno7: Item[] = [
  {
    id: 'a7_cracha_crise',
    nome: 'Crachá do Centro de Crise',
    descricao: 'Crachá laranja com a palavra RESPOSTA e um campo "função no incidente" que você preencheu a caneta. Atrás, a regra da Nanda: "fato na esquerda, hipótese na direita, café no meio".',
  },
  {
    id: 'a7_barbante',
    nome: 'Rolo de Barbante Vermelho',
    descricao: 'Sobra do quadro de investigação da Oficina do Bem-te-vi. Sua mãe gastou 412 metros em onze anos. Ela mediu. Claro que mediu.',
  },
  {
    id: 'a7_runbook',
    nome: 'Runbook do Apagão, 2015',
    descricao: 'Caderno de capa dura com o plano de resposta que seus pais escreveram na véspera do primeiro apagão, com anotações novas da sua mãe em tinta verde. Página 1: "Primeiro, não entre em pânico. Segundo, anote a hora em UTC".',
  },
  {
    id: 'a7_relogio_rui',
    nome: 'Relógio Parado do Pai',
    descricao: 'O relógio de pulso do seu pai, parado às 23h50 de 2015. Ele se recusou a acertar: "é evidência". Prometeu dar corda junto com você no dia em que o Nulo fosse preso. Cumpriu.',
  },
  {
    id: 'a7_diploma',
    nome: 'Diploma de Paranapiacaba',
    descricao: 'Diploma da Escola de Bruxaria Cibernética, assinado pela Diretora Iolanda e, numa segunda via plastificada, pela Vó Cida. A Vó imprimiu em papel 180 g. Duas vias.',
  },
  {
    id: 'a7_bilhete',
    nome: 'Camada 7 da pasta NAO_ABRA: o bilhete',
    descricao: 'A última camada, que só abriu com a metade da chave da sua mãe e a metade do seu pai juntas. Dentro, um bilhete escaneado na letra dela: "Bem-te-vi, agora a chave é sua. Use para abrir, nunca para trancar ninguém do lado de fora."',
  },
];
