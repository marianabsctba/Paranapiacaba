import type { Feitico, Criatura, Figurinha, Item, Lugar, Personagem } from '../tipos';

export const feiticos3: Feitico[] = [
  { id: 'a3_f_registrum', nome: 'Registrum Revelio', comando: 'ls -l /var/log', descricao: 'Mostra a gaveta onde o Linux guarda os diários. Tudo o que o sistema fofoca vai parar aqui.' },
  { id: 'a3_f_caput', nome: 'Caput Primum', comando: 'head -n 5 arquivo', descricao: 'Lê só o começo de um arquivo. Ideal para saber de que se trata sem ler 2 GB de log, igual ler só o assunto do e-mail da reunião.' },
  { id: 'a3_f_cauda', nome: 'Cauda Ultima', comando: 'tail -n 20 arquivo', descricao: 'Lê só o final do arquivo, onde moram as notícias mais recentes. O "últimas mensagens" do grupo da família.' },
  { id: 'a3_f_paginatus', nome: 'Paginatus Minimus', comando: 'less arquivo', descricao: 'Abre arquivos gigantes página por página, com busca usando /. Sai com q. Menos é mais, e less é mais que more.' },
  { id: 'a3_f_tempus', nome: 'Tempus Universalis', comando: 'date -u', descricao: 'Mostra a hora em UTC, o fuso que não muda com horário de verão nem com a opinião do síndico.' },
  { id: 'a3_f_grep', nome: 'Grepio Inventarium', comando: 'grep "texto" arquivo', descricao: 'Procura um texto dentro de arquivos e devolve só as linhas que casam. A lupa mais usada da forense.' },
  { id: 'a3_f_grep_c', nome: 'Grepio Contatum', comando: 'grep -c "texto" arquivo', descricao: 'Em vez de mostrar as linhas, conta quantas casaram. Para quando a pergunta é "quantas vezes?" e não "quais?".' },
  { id: 'a3_f_cauda_viva', nome: 'Cauda Vigilans', comando: 'tail -f arquivo', descricao: 'Fica olhando o fim do arquivo ao vivo. Cada linha nova aparece na hora. Sai com Ctrl+C. Plantão em forma de comando.' },
  { id: 'a3_f_wc', nome: 'Numerus Linearum', comando: 'wc -l arquivo', descricao: 'Conta linhas. Parece pouco, mas "quantas tentativas de login falharam?" começa aqui.' },
  { id: 'a3_f_sort', nome: 'Ordinatio Temporis', comando: 'sort arquivo', descricao: 'Põe as linhas em ordem. Com -n ordena por número, com -r inverte. Base de toda linha do tempo.' },
  { id: 'a3_f_uniq', nome: 'Unicus Contatus', comando: 'sort arquivo | uniq -c', descricao: 'Junta linhas repetidas vizinhas e conta quantas eram. Sempre depois de um sort, senão ele só junta vizinhas.' },
  { id: 'a3_f_pipe', nome: 'Canalis Magnus', comando: 'grep "Failed" auth.log | sort | uniq -c | sort -nr', descricao: 'O cano |: a saída de um feitiço vira a entrada do próximo. Encadeie lupa, ordem e contagem e o log confessa.' },
  { id: 'a3_f_journal', nome: 'Diarium Servitii', comando: 'journalctl -u ssh --since today', descricao: 'Consulta o diário do systemd filtrando por serviço e por data. O log moderno que não é arquivo de texto.' },
  { id: 'a3_f_fenestra', nome: 'Eventus Fenestrae', comando: 'wevtutil qe Security /c:10 /rd:true /f:text', descricao: 'Consulta o log de Segurança do Windows pelo terminal: os 10 eventos mais recentes, em texto. Sem clicar em nada, para alegria do Prof. Otávio.' },
  { id: 'a3_f_digestum', nome: 'Digestum Integritatis', comando: 'sha256sum evidencia.img', descricao: 'Calcula a impressão digital SHA-256 de um arquivo. Mudou um bit, muda o hash inteiro. Evidência sem hash é fofoca.' },
  { id: 'a3_f_copia', nome: 'Copia Triplex', comando: 'rsync -a origem/ destino/', descricao: 'Copia pastas preservando datas, permissões e donos, e na segunda vez só manda o que mudou. Primeiro passo de um backup decente.' },
];

export const criaturas3: Criatura[] = [
  {
    id: 'a3_sequestrador_gavetas',
    nome: 'Sequestrador de Gavetas',
    real: 'Ransomware: malware que cifra os arquivos da vítima e cobra resgate pela chave. Os grupos modernos também roubam os dados antes (dupla extorsão).',
    perigo: 5,
    descricao: 'Um bicho de lata com cadeados no lugar das escamas. Entra numa estante e tranca cada gaveta com uma chave que só ele tem. Deixa um bilhete educado pedindo Bitcoronas.',
    defesa: 'Backup 3-2-1 com uma cópia offline ou imutável, testado de verdade; MFA em todo acesso remoto; nada de RDP exposto na internet; atualizações em dia; menor privilégio; e monitorar sinais como apagamento de cópias de sombra (vssadmin) e limpeza de log (evento 1102).',
  },
  {
    id: 'a3_apagador',
    nome: 'Borracha Faminta',
    real: 'Antiforense: limpeza ou adulteração de logs para esconder a invasão, como apagar o log de Segurança do Windows (gera o evento 1102) ou truncar /var/log/auth.log.',
    perigo: 4,
    descricao: 'Uma lesma rosa que come linhas de diário. O problema é que ela sempre deixa uma gosma: o próprio ato de apagar fica registrado.',
    defesa: 'Enviar os logs em tempo real para um coletor central (syslog remoto, SIEM) onde o invasor não tem acesso; alertar no evento 1102 e no 104 do log System; controlar quem tem permissão de limpar logs.',
  },
  {
    id: 'a3_toupeira',
    nome: 'Toupeira de Senha Padrão',
    real: 'Ataque de força bruta e de senhas padrão: tentativas em massa de usuário e senha, ou uso da senha de fábrica que ninguém trocou.',
    perigo: 3,
    descricao: 'Cava túneis tentando cada porta com as mesmas chaves: admin, 123456, Senha@123. Quase nunca acerta. Quase.',
    defesa: 'Trocar toda senha padrão na instalação, MFA, bloqueio de conta após várias falhas, limitar o acesso por IP ou VPN e alertar quando há muitos 4625 (ou "Failed password") seguidos de um sucesso.',
  },
  {
    id: 'a3_carrapato',
    nome: 'Carrapato de Fornecedor',
    real: 'Abuso de acesso de terceiros: contas de suporte de fornecedor, com acesso remoto permanente e pouca vigilância, usadas como porta de entrada.',
    perigo: 4,
    descricao: 'Pequeno, simpático, vem grudado no contrato de manutenção. Fica anos no corpo da rede sem ninguém lembrar que ele está lá.',
    defesa: 'Inventário de contas de terceiros, acesso só quando necessário e com prazo, MFA, senha única, registro e revisão de cada sessão, e desligar a conta quando o contrato acaba.',
  },
  {
    id: 'a3_lagartixa_relogio',
    nome: 'Lagartixa do Relógio Torto',
    real: 'Timestomping e confusão de fuso: alterar a data de arquivos ou misturar horários de fusos diferentes para bagunçar a linha do tempo.',
    perigo: 2,
    descricao: 'Mexe nos ponteiros de tudo que encosta. Não destrói nada, só faz você achar que o crime aconteceu três horas antes.',
    defesa: 'Relógios sincronizados por NTP, logs em UTC, comparar várias fontes independentes (o horário de um arquivo pode mentir, o do coletor central é mais difícil) e anotar o fuso de cada fonte na linha do tempo.',
  },
  {
    id: 'a3_corujao',
    nome: 'Corujão da Exfiltração',
    real: 'Exfiltração de dados antes da cifragem: o grupo copia os arquivos para fora e ameaça publicar, mesmo que a vítima tenha backup.',
    perigo: 4,
    descricao: 'Voa de madrugada com os livros no bico. Volta só para piar no seu telhado: "paga ou eu leio em voz alta".',
    defesa: 'Monitorar volume de tráfego de saída fora do padrão, bloquear serviços de upload não usados, segmentar a rede, cifrar dados sensíveis em repouso e ter plano de resposta que inclua comunicação e LGPD.',
  },
];

export const figurinhas3: Figurinha[] = [
  { id: 'a3_fig_mariposa', nome: 'A mariposa no livro de registro', ano: '1947', texto: 'Em 9 de setembro de 1947, a equipe do Harvard Mark II, onde trabalhava Grace Hopper, colou uma mariposa no livro de registro com a nota "First actual case of bug being found". Um log em papel, com timestamp e evidência anexada. Cadeia de custódia aprovada.' },
  { id: 'a3_fig_locard', nome: 'Edmond Locard', ano: '1910', texto: 'Criou em Lyon, em 1910, um dos primeiros laboratórios de polícia científica. A ideia associada a ele, "todo contato deixa um rastro", é o princípio de troca de Locard. No computador, o rastro se chama log.' },
  { id: 'a3_fig_stoll', nome: 'Clifford Stoll', ano: '1986', texto: 'Astrônomo no Laboratório Lawrence Berkeley, investigou uma diferença de 75 centavos na contabilidade de uso das máquinas e acabou rastreando um invasor que vendia informações. Contou tudo no livro "The Cuckoo\'s Egg". Nunca ignore 75 centavos.' },
  { id: 'a3_fig_allman', nome: 'Eric Allman e o syslog', ano: '1980', texto: 'O syslog nasceu nos anos 1980 como parte do projeto Sendmail, criado por Eric Allman em Berkeley. Virou o jeito padrão de máquinas Unix mandarem log. Quem diria que um carteiro de e-mail ia inventar o diário.' },
  { id: 'a3_fig_rfc5424', nome: 'RFC 5424', ano: '2009', texto: 'Em 2009, a RFC 5424 padronizou o protocolo syslog moderno, com timestamp completo e fuso horário. A RFC 3164, de 2001, só tinha documentado o formato antigo, que nem ano tinha na data.' },
  { id: 'a3_fig_aids_trojan', nome: 'O Trojan AIDS', ano: '1989', texto: 'Considerado o primeiro ransomware conhecido: disquetes distribuídos num congresso que, depois de umas 90 reinicializações, escondiam e embaralhavam nomes de arquivos e pediam 189 dólares enviados a uma caixa postal no Panamá. Boleto por correio.' },
  { id: 'a3_fig_wannacry', nome: 'WannaCry', ano: '2017', texto: 'Em 12 de maio de 2017, um ransomware se espalhou pela falha EternalBlue no SMBv1 (porta 445) e atingiu centenas de milhares de máquinas. Foi freado quando o pesquisador Marcus Hutchins registrou um domínio que servia de "botão de desligar". Atualização de segurança existia desde março.' },
  { id: 'a3_fig_notpetya', nome: 'NotPetya', ano: '2017', texto: 'Em 27 de junho de 2017, um malware que fingia ser ransomware, mas na prática destruía dados, se espalhou a partir da atualização de um software de contabilidade ucraniano (M.E.Doc). Exemplo clássico de ataque pela cadeia de fornecedores.' },
];

export const itens3: Item[] = [
  { id: 'a3_lacre', nome: 'Saco de Evidência com Lacre Numerado', descricao: 'Presente da Profa. Dulce. Tem campo para data, hora em UTC, quem coletou e quem recebeu. Rasgou, acabou a confiança.' },
  { id: 'a3_moletom_utc', nome: 'Moletom "Meu Fuso é UTC"', descricao: 'Moletom cinza com um relógio sem ponteiros. Quem pergunta a hora recebe a resposta com Z no final.' },
  { id: 'a3_luminaria_tail', nome: 'Luminária Cauda Vigilante', descricao: 'Enfeite de dormitório: pisca de leve a cada linha nova num log que você escolher. A colega de beliche pediu para você escolher um log mais calmo.' },
  { id: 'a3_hd_tati', nome: 'HD Externo da Tati', descricao: 'Etiqueta: "CÓPIA 2 DE 3, MÍDIA DIFERENTE, NÃO EMPRESTAR, NÃO TOCAR, NÃO OLHAR". Salvou a biblioteca. A Tati deixa você segurar por cinco segundos.' },
  { id: 'a3_logs_2015', nome: 'Camada 3: Registros de 2015', descricao: 'Logs exportados do notebook da sua mãe, da noite do Grande Apagão. Mostram seus pais seguindo conexões do Nulo de servidor em servidor até as 03:12 UTC. Depois disso, silêncio.' },
];

export const lugares3: Lugar[] = [
  {
    id: 'a3_sala_rastros',
    nome: 'Sala de Leitura de Rastros',
    descricao: 'Antiga sala do telégrafo da ferrovia, com fitas de papel perfurado nas paredes e uma mesa de luz. Aqui a Profa. Dulce ensina a ler o que as máquinas confessam.',
    ano: 3,
    cena: 'sala',
    segredos: [
      { feitico: 'a3_f_registrum', texto: 'Uma gaveta da mesa de luz tem a etiqueta /var/log/telegrafo. Dentro, fitas de 1889 com o primeiro "log" do castelo: "Neblina. Trem atrasado. Culpa da neblina."', efeito: { xp: 20, atributos: { forense: 1 } } },
      { feitico: 'a3_f_tempus', texto: 'O relógio da parede estava três horas adiantado havia trinta anos. Você acerta para UTC e ele, pela primeira vez, faz tique-taque satisfeito.', efeito: { xp: 15, pontosCasa: 5 } },
      { feitico: 'a3_f_digestum', texto: 'Uma caixa lacrada traz um hash escrito à mão. Você calcula e confere: bate. É a fita de formatura da Profa. Dulce, intacta desde 1994.', efeito: { xp: 20, amizade: { a3_dulce: 2 } } },
    ],
  },
  {
    id: 'a3_arquivo_morto',
    nome: 'Arquivo Morto da Biblioteca',
    descricao: 'Porão embaixo da biblioteca, com caixas de log impresso que a Zuleica se recusa a jogar fora. "Um dia alguém vai precisar", ela diz. Esse dia chegou.',
    ano: 3,
    cena: 'masmorra',
    segredos: [
      { feitico: 'a3_f_grep', texto: 'Você procura "Zuleica" e acha 4.112 ocorrências. Todas são assinaturas dela em empréstimos. Uma é um bilhete: "devolva o livro, Iolanda, 1987".', efeito: { xp: 15, amizade: { zuleica: 1 } } },
      { feitico: 'a3_f_caput', texto: 'A primeira linha da caixa mais antiga diz só: "Este arquivo começa aqui. Não comece pelo meio." Bom conselho para qualquer log.', efeito: { xp: 10, atributos: { forense: 1 } } },
      { feitico: 'a3_f_uniq', texto: 'Contando os nomes repetidos, você descobre que o livro mais emprestado da história do castelo é "Como Desligar e Ligar de Novo", com 1.338 empréstimos.', efeito: { xp: 15, figurinha: 'a3_fig_mariposa' } },
    ],
  },
  {
    id: 'a3_cofre_fitas',
    nome: 'Cofre de Fitas do Seu Zé',
    descricao: 'Uma casinha de pedra na vila, longe do castelo, onde o Seu Zé guarda fitas de backup numa geladeira desligada. "Se pegar fogo lá em cima, aqui embaixo ninguém sente."',
    ano: 3,
    cena: 'cidade',
    segredos: [
      { feitico: 'a3_f_copia', texto: 'Na prateleira, uma fita com a etiqueta "TESTE DE RESTAURAÇÃO: FEITO" e a data de todo mês, há doze anos. O Seu Zé testa backup. O Seu Zé é um herói.', efeito: { xp: 20, amizade: { seu_ze: 2 } } },
      { feitico: 'a3_f_sort', texto: 'Ordenando as etiquetas por data, você nota uma fita faltando: novembro de 2015. Alguém levou. Embaixo do buraco, um bilhete: "L. levou. Volta um dia."', efeito: { xp: 25, flag: 'a3_fita_2015' } },
    ],
  },
  {
    id: 'a3_sala_coletor',
    nome: 'Sala do Coletor Central',
    descricao: 'Um armário no fundo do data center onde um servidor velho, apelidado de Fofoqueiro, recebe cópia de todo log do castelo por syslog. Ninguém lembrava que ele existia. Ele lembrava de tudo.',
    ano: 3,
    cena: 'sala',
    segredos: [
      { feitico: 'a3_f_cauda_viva', texto: 'Você deixa o Fofoqueiro em tail -f e vê, ao vivo, a cafeteira da Diretora reclamando que o filtro acabou. Ela manda log por syslog. Claro que manda.', efeito: { xp: 15, item: 'a3_luminaria_tail' } },
      { feitico: 'a3_f_pipe', texto: 'Contando as origens dos logs, você descobre que 40% de tudo que chega vem da impressora do segundo andar, que avisa "pouco toner" a cada 30 segundos desde 2019.', efeito: { xp: 15, atributos: { defesa: 1 } } },
      { feitico: 'a3_f_journal', texto: 'No diário do próprio Fofoqueiro, uma linha de 2015: "rsyslogd: origem LENA-NOTE conectada". Era o notebook da sua mãe.', efeito: { xp: 25, flag: 'a3_mae_no_coletor' } },
    ],
  },
];

export const personagens3: Personagem[] = [
  { id: 'a3_dulce', nome: 'Profa. Dulce Arantes', papel: 'Leitura de Rastros, perita aposentada da polícia científica, anota tudo com hora em UTC', cor: '#f4a261', pele: '#6f4e37', cabelo: '#c0c0c0', estilo: 'curto', oculos: true, roupa: '#264653' },
  { id: 'a3_rogerio', nome: 'Rogério da Gavetec', papel: 'técnico da empresa que mantém o sistema da biblioteca, responde tudo com "no ambiente de teste funcionava"', cor: '#e9c46a', pele: '#f1c27d', cabelo: '#4a3728', estilo: 'curto', roupa: '#2a9d8f' },
];
