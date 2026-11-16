# Bíblia de Paranapiacaba

Jogo para o navegador que ensina segurança cibernética do zero, numa escola de bruxaria cibernética escondida na serra de Paranapiacaba (SP). Sete anos letivos, muito humor técnico, enredo e personagens originais.

## Regras de escrita (valem para todo texto do jogo)

1. **Nunca usar travessão** (nem o longo, nem o meia-risca, Unicode U+2014 e U+2013). Use vírgula, dois-pontos, parênteses ou ponto. O teste automático reprova.
2. **Português com acentuação correta** em tudo que a pessoa lê. Identificadores (ids, chaves) em ASCII sem acento.
3. **Tudo original.** O jogo é do gênero "escola de magia", mas não reconta nem imita cenas, personagens, falas ou acontecimentos de nenhum livro ou filme existente. Nada de trocar nomes de personagens conhecidos por trocadilhos. Os personagens e o enredo desta bíblia são nossos; invente a partir deles.
4. **Técnica de verdade.** Comando, porta, protocolo, número de evento do Windows, tudo correto e verificável. Humor nunca troca a informação certa por piada errada. A explicação da aula é didática, do zero, como um bom professor faria.
5. **Ética sempre.** Parte ofensiva é laboratório autorizado, CTF, pentest com contrato. Os vilões fazem coisa errada fora de cena, sem receita passo a passo. Toda técnica ofensiva vem com a defesa.
6. **Humor demais.** Piada de TI, de Brasil, de reunião, de LinkedIn, de boleto, de grupo da família, de "funciona na minha máquina". Ácido mas carinhoso, sem humilhar ninguém, sem preconceito.
7. **Pronomes da pessoa que joga:** ela escolhe ele, ela ou elu. Prefira frases neutras ("Que bom ter você aqui"). Quando precisar flexionar, use `{o/a/e}` ou o trio completo `{bem-vindo/bem-vinda/bem-vinde}`, sempre na ordem ele/ela/elu. `{nome}` é o nome escolhido, `{casa}` a casa.
8. Falas curtas, de celular: até uns 280 caracteres cada. Melhor várias falas curtas que uma longa.

## Mundo

- **Paranapiacaba**: a Escola de Bruxaria Cibernética fica num castelo de pedra e ferro escondido na neblina da serra, construído por engenheiros ferroviários bruxos no século XIX. Quem não tem convite vê só a vila e o museu.
- **Desconectados**: pessoas sem magia de terminal. Usam a senha `123456` e clicam em "você ganhou um iPhone". Ninguém zomba delas; o jogo zomba dos hábitos, não das pessoas.
- **Varinha** é um teclado mecânico encantado. Cada um escolhe o seu na Galeria Oculta da Santa Ifigênia.
- **Feitiços** são comandos reais (`ls`, `cat`, `chmod`, `grep`, `nmap`, `openssl`...). Cada um ganha um nome mágico em latim macarrônico (Listarium, Catalogus, Permissio Mutatio...).
- **Correio**: pombos-correio (RFC 1149, IP sobre aves, é real). O seu se chama **Pomba Edite**.
- **Esporte**: **Capturebol**. Dois times de sete em vassouras-drone. Os atacantes resolvem enigmas e lançam "pacotes" nos aros, o goleiro é o firewall, os rebatedores desviam as **Bolas de Spam**, e o caçador persegue a **Flag Dourada**, que vale 150 e encerra a partida.
- **Moeda**: Bitcoronas. Não tem Pix porque a Secretaria ainda está "avaliando".
- **Secretaria de Bruxaria Digital**, em Brasília, atrás de um orelhão. Secretário Válter Prado, especialista em nota oficial.
- **Casas** (o **Capacete Classificador**, capacete de obra com um modelo de ML de 1997, decide; o motor cuida disso no passo `selecao`):
  - **Onçarina** (onça-pintada; coragem; Red Team ético)
  - **Tucanal** (tucano; curiosidade; pesquisa e Threat Intel)
  - **Capivárias** (capivara; calma e lealdade; Blue Team e SOC)
  - **Jararacas** (jararaca; astúcia; engenharia social e persuasão, do lado da defesa)
- **Taça das Casas** no fim de cada ano (o motor calcula; o conteúdo só põe o passo `fimDeAno` no último capítulo).

## A pessoa que joga

Tem 11 anos no começo, mora com a **Vó Cida** em Nova Iguaçu (RJ). Os pais, **Rui** e **Lena**, eram bruxos de resposta a incidente e sumiram no **Grande Apagão de 2015**, quando metade das redes bruxas do país caiu numa noite. A versão oficial diz que morreram. A Vó guardou o **notebook antigo da mãe**, com uma pasta cifrada chamada `NAO_ABRA`. A cada ano, com o que aprende, a pessoa decifra uma camada da pasta (é o fio do mistério da saga, e uma recompensa no fim de cada ano).

## Elenco fixo (ids entre parênteses, use exatamente esses)

- Vó Cida (`vo_cida`): imprime e-mail para ler, desconfia de tudo, adora um áudio de 6 minutos.
- **Tati Okamoto** (`tati`): da Liberdade (SP), planilheira, ansiosa, brilhante em cripto.
- **Cauã Ferreira** (`caua`): de Belém, conserta tudo com fita isolante, coragem antes de pensar, ama açaí com peixe.
- **Bia Kruger** (`bia`): de Blumenau, goleira de Capturebol, sincera ao ponto de ser auditoria.
- **Jonas Bezerra** (`jonas`): de Caruaru, poeta de cordel e de mensagem de commit.
- **Enzo Valentim** (`enzo`): rival, filho de influencer de cripto; arrogante, mas com arco de redenção ao longo dos anos.
- **Diretora Iolanda Sertã** (`iolanda`): ex-hacker da era do modem discado, provérbios adulterados ("quem tem backup tem tudo").
- **Prof. Otávio Quintela** (`otavio`): Feitiços de Terminal (`sistemas`).
- **Profa. Ruth Amaral** (`ruth`): Encantamento de Redes (`redes`), ex-técnica de telefonia.
- **Prof. Heitor Lisboa** (`heitor`): Criptografia (`cripto`), sarcástico, parece suspeito por anos, na verdade protege a pessoa a pedido da mãe.
- **Profa. Nanda Siqueira** (`nanda`): Defesa e Vigilância (`defesa`), toma café em balde.
- **Baltazar** (`baltazar`): tratador das criaturas-malware no Viveiro, ex-pescador de Ubatuba.
- **Zuleica** (`zuleica`): bibliotecária.
- **Seu Zé do Rack** (`seu_ze`): zelador do data center.
- **Bitu** (`bitu`): gato preto que pisa no teclado.
- **Capacete Classificador** (`chapeu`).
- **O Nulo** (`nulo`): vilão. Ex-aluno brilhante (nome de nascença Gabriel Nunes), expulso por montar uma botnet com as geladeiras da vila. Sumiu da internet; o Grande Apagão foi obra dele. Quer a **Chave Mestra das Redes Bruxas** para controlar tudo. Fala com calma de RH demitindo alguém.
- **Marlene Cabral** (`marlene`): braço direito do Nulo, ex-diretora de TI que vende acesso inicial.
- **Secretário Válter Prado** (`deputado`).

Cada ano pode criar personagens próprios no arquivo dele (id com prefixo do ano, ex.: `a4_rafa`), sempre originais.

## Disciplinas (nome no jogo, atributo)

- Feitiços de Terminal (Otávio): `sistemas`
- Encantamento de Redes (Ruth): `redes`
- Criptografia (Heitor): `cripto`
- Defesa e Vigilância (Nanda): `defesa`
- Trato das Criaturas-Malware (Baltazar): `forense` ou `defesa`
- Leitura de Rastros (forense, a partir do ano 3): `forense`
- Artes da Web (a partir do ano 4): `web`
- Persuasão e Engano (engenharia social, defesa contra golpes): `social`
- Laboratório de Ataque Autorizado (a partir do ano 4): `ofensiva`
- História da Computação (para figurinhas de pioneiros reais)

## Arco dos sete anos (enredo original)

O currículo vai do zero absoluto ao avançado. Cada ano assume o que os anteriores ensinaram. Cada ano tem um mistério próprio que fecha no fim, e avança um pouco o mistério dos pais e do Nulo.

### Ano 1: O Convite Cifrado (`ano1.ts`)
Ciber: o que é um computador (CPU, memória, disco), bits e bytes, binário e hexadecimal, sistema operacional, arquivos e pastas, terminal (`pwd`, `ls`, `cd`, `cat`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `man`), arquivos ocultos, permissões (`rwx`, `chmod`, dono e grupo), usuários e `sudo`, senhas fortes, gerenciador de senha, MFA, phishing básico, atualizações.
História: o convite chega como um QR code impresso no verso da conta de luz da Vó (que acha que é golpe, e ensina a pessoa a desconfiar, o que é ótimo). Baltazar vem buscar. Compras na Galeria Oculta da Santa Ifigênia (o teclado escolhe a pessoa). Subida de trem pela serra; conhece Tati, Cauã e Bia; Enzo esnoba. Seleção de casa. Primeiras aulas. Mistério do ano: senhas de alunos e professores estão sendo roubadas no castelo, e os alunos recebem e-mails falsos da "Diretoria". A turma descobre uma criatura de phishing (o **Isca-d'Água**, um peixe que imita qualquer remetente) solta de propósito no castelo, e alguém por trás dela quer a senha do **Cofre de Senhas da Diretora**. Primeiro jogo de Capturebol. Natal no castelo (a Vó manda um panetone por pombo). Final: a turma protege o cofre ativando MFA e descobre que quem soltou a criatura foi uma professora substituta, a Profa. Dalva Mendonça (`a1_dalva`), que trabalhava para o Nulo. Camada 1 da pasta da mãe: uma foto dos pais com um bilhete "se você leu isso, aprendeu `ls -a`".

### Ano 2: A Rede Embaixo do Castelo (`ano2.ts`)
Ciber: redes do zero. Cliente e servidor, IP (v4, privado e público, máscara, CIDR básico), MAC, roteador e switch, portas e serviços (22, 53, 80, 443, 445, 3389), TCP x UDP, handshake de três vias, DNS, `ping`, `traceroute`, `ip a`/`ipconfig`, `nslookup`/`dig`, `ss`/`netstat`, Wi-Fi e WPA2/WPA3, modelo OSI e TCP/IP, worms e segmentação.
História: túneis ferroviários abandonados embaixo do castelo guardam a **Rede Antiga**, cabeamento de 1890 adaptado. Um worm (a **Lacraia de Cobre**) começa a pular de máquina em máquina pelo cabeamento velho e as salas vão ficando sem rede. A turma mapeia a rede antiga, descobre que alguém religou um switch esquecido nos túneis, e segmenta a rede para conter a Lacraia. Capturebol contra Jararacas. Enzo é acusado e a pessoa, mesmo rival, ajuda a provar que não foi ele. Camada 2 da pasta: um mapa de rede desenhado à mão pela mãe, com "Apagão" escrito num nó.

### Ano 3: Os Registros Perdidos (`ano3.ts`)
Ciber: logs e forense básica. O que é log, onde fica (`/var/log`, Visualizador de Eventos), syslog, timestamps e fuso (UTC!), `grep`, `tail -f`, `less`, `head`, `wc`, `sort`, `uniq`, pipes, eventos do Windows (4624, 4625, 4672, 4688, 4720, 1102), linha do tempo, cadeia de custódia, hash para integridade de evidência, backup 3-2-1, snapshots, ransomware e recuperação.
História: um ransomware (o **Sequestrador de Gavetas**) cifra a biblioteca e a Zuleica chora em cima do índice. O Secretário Válter culpa o Baltazar e quer fechar o Viveiro. A turma faz a linha do tempo pelos logs e prova que a invasão veio de uma conta de fornecedor com senha padrão. Restauram tudo do backup (a Tati tinha feito um backup 3-2-1 da biblioteca por ansiedade). Camada 3 da pasta: logs de 2015 que mostram que os pais estavam rastreando o Nulo na noite do Apagão.

### Ano 4: O Torneio das Bandeiras (`ano4.ts`)
Ciber: web do zero. HTTP (métodos, status, cabeçalhos), cookies e sessões, HTML/JS básicos, URL, HTTPS e TLS (visão geral), OWASP Top 10, injeção SQL (conceito, em laboratório) e consultas parametrizadas, XSS e escape/CSP, CSRF, IDOR, senhas em banco (hash com sal, bcrypt/argon2), upload perigoso, WAF.
História: Paranapiacaba sedia o **Torneio das Bandeiras**, um CTF de web entre três escolas: Paranapiacaba, o **Colégio Pampa Digital** (de Pelotas) e a **Academia do Sertão** (de Juazeiro). Times mistos; a pessoa e Enzo caem no mesmo time e se odeiam até a terceira prova. Provas: invadir (com autorização) uma loja de laboratório e reportar falhas, defender a própria aplicação ao vivo, e uma prova final em que alguém de fora tenta sabotar o placar. Descobrem que o servidor do torneio foi alterado por um infiltrado para roubar credenciais das três escolas. A pessoa ganha ou empata, e o Nulo manda a primeira mensagem direta: "você é igual à sua mãe". Camada 4 da pasta: um código-fonte incompleto com o nome "projeto CHAVE MESTRA".

### Ano 5: Plantão (`ano5.ts`)
Ciber: Blue Team. SOC e níveis de analista, SIEM, correlação, regras de detecção (Sigma em linhas gerais), IDS/IPS, EDR, falso positivo e negativo, triagem, MITRE ATT&CK, playbook, resposta a incidente (NIST SP 800-61: preparação, detecção e análise, contenção, erradicação, recuperação, lições aprendidas), hardening, menor privilégio, segmentação, gestão de vulnerabilidade, CVE e CVSS.
História: os ataques do Nulo crescem pelo país. A Secretaria terceiriza a segurança do castelo para a **Segurança Garantida Ltda.**, consultoria do pai do Enzo, que entrega relatório bonito e nenhum monitoramento. A Profa. Nanda é afastada por "excesso de alertas". A turma monta um **SOC clandestino** no antigo galpão de manutenção dos trens, com plantões de madrugada. Detectam e contêm uma intrusão real que a consultoria ignorou. Enzo descobre o que o pai está fazendo e ajuda a turma. Camada 5 da pasta: uma gravação de áudio da mãe dizendo que está viva.

### Ano 6: O Código da Mãe (`ano6.ts`)
Ciber: malware e engenharia reversa. Tipos de malware, análise estática (hash, strings, cabeçalho PE/ELF, imports), análise dinâmica em sandbox, `strings`, `file`, `sha256sum`, YARA (regras simples), ofuscação e empacotamento, comunicação com C2, memória (o que é dump de RAM, processos, Volatility em conceito), indicadores de comprometimento, threat intel e STIX em linhas gerais.
História: a turma analisa as amostras do Nulo guardadas no Viveiro e descobre que o malware dele tem pedaços do código da mãe da pessoa (ele roubou o projeto dela). O Prof. Heitor revela que conhecia os pais e que a mãe está escondida desde 2015, rodando uma investigação. Marlene invade o castelo; a Diretora Iolanda é ferida e fica afastada (sem morte). Camada 6 da pasta: a localização da mãe.

### Ano 7: O Grande Apagão (`ano7.ts`)
Ciber: Active Directory e resposta a incidente completa. Domínio, controlador de domínio, usuários, grupos, GPO, Kerberos (TGT, TGS, krbtgt), NTLM, pass-the-hash, kerberoasting e Golden Ticket em conceito e com detecção, menor privilégio e camadas administrativas, persistência (Run keys, tarefas agendadas, serviços, WMI, cron), threat hunting, contenção em escala, reset da krbtgt duas vezes, recuperação, comunicação de crise, LGPD e notificação.
História: o Nulo lança o segundo Grande Apagão contra todas as escolas e a Secretaria. A pessoa reencontra a mãe (Lena volta) e o pai é encontrado vivo também, preso numa instalação do Nulo. A batalha final é uma resposta a incidente de verdade, sala por sala do castelo, com toda a turma usando o que aprendeu em sete anos: caçar as persistências, revogar o Golden Ticket, isolar o domínio, restaurar de backup. O Nulo é derrotado sem violência, por evidência: a perícia da turma o identifica e ele é preso pela Secretaria. Formatura com discurso do Jonas em cordel. Camada 7 da pasta: um bilhete da mãe, "agora a chave é sua".

## Formato

Siga `src/conteudo/tipos.ts` à risca. O motor mostra:
- `cena`: falas em sequência, com retrato do personagem.
- `aula`: abertura com o professor, explicação (parágrafos), exercícios um a um; o feitiço entra no grimório ao concluir.
- `escolha`: botões; efeito e resposta.
- `desafio`: tensão da história resolvida com um exercício.
- `recompensa`: cartão de "você ganhou".
- `selecao` e `fimDeAno`: o motor cuida.
