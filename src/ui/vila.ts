// Coisas para fazer na Vila de Paranapiacaba: cada atendente tem uma atividade, uma vez por capítulo.
import type { Atributo } from '../conteudo/tipos';
import { ANOS, FIGURINHAS } from '../conteudo/index';
import { estado, salvar } from '../motor/estado';
import { aplicar } from '../motor/progresso';
import { fmt, personaliza } from '../motor/texto';
import { aviso, botao, embaralha, h } from './dom';

type Janela = (titulo: string, ...conteudo: Node[]) => { fechar: () => void };

/** marca de "já fez isso neste capítulo" (passeio de fim de semana) */
function jaFez(atividade: string): boolean {
  const s = estado();
  return s.flags.includes(`vila:${atividade}:${s.pos.ano}:${s.pos.cap}`);
}
function marcar(atividade: string) {
  const s = estado();
  s.flags.push(`vila:${atividade}:${s.pos.ano}:${s.pos.cap}`);
  salvar();
}
const sorteia = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const p = (t: string) => h('p', { html: fmt(t) });
const voltaDepois = (quem: string) => p(`${quem}: Volta no próximo fim de semana que eu separo outra.`);

// ---------------------------------------------------------------- livraria: curiosidades verdadeiras

const LIVROS: { titulo: string; texto: string; atributo: Atributo }[] = [
  { titulo: 'RFC 2324, edição de bolso', texto: 'Em 1998 saiu a RFC 2324, um protocolo de brincadeira para controlar cafeteiras pela rede. O código de erro **418 I\'m a teapot** nasceu nela e até hoje tem servidor que responde com ele.', atributo: 'web' },
  { titulo: 'O Cérebro de Lahore', texto: 'O **Brain**, de 1986, é considerado o primeiro vírus de PC para MS-DOS. Foi escrito por dois irmãos no Paquistão e trazia o nome, o endereço e o telefone deles dentro do código.', atributo: 'ofensiva' },
  { titulo: 'A mariposa do Mark II', texto: 'Em 1947, a equipe de **Grace Hopper** achou uma mariposa presa num relé do computador Mark II e colou o inseto no diário de bordo com a anotação "primeiro caso real de bug encontrado".', atributo: 'sistemas' },
  { titulo: 'A Enigma e a letra teimosa', texto: 'A máquina **Enigma** nunca cifrava uma letra como ela mesma. Esse detalhe de projeto ajudou Alan Turing e a equipe de Bletchley Park a descartar chaves e quebrar mensagens.', atributo: 'cripto' },
  { titulo: 'Antes do DNS', texto: 'Antes de 1983, cada computador da rede usava um arquivo **HOSTS.TXT** baixado de um servidor central para saber o endereço dos outros. O **DNS**, criado por Paul Mockapetris, acabou com isso.', atributo: 'redes' },
  { titulo: 'O cadeado não é atestado de bons antecedentes', texto: 'O cadeado do navegador mostra que a conexão usa **TLS** e está cifrada. Ele não diz que o site é honesto: golpista também tira certificado.', atributo: 'web' },
  { titulo: 'Júlio César e as 25 chaves', texto: 'A **cifra de César** troca cada letra por outra um número fixo de posições à frente. Como só existem 25 deslocamentos possíveis, dá para quebrar testando todos.', atributo: 'cripto' },
  { titulo: 'O verme de 1988', texto: 'O **worm Morris**, de 1988, se espalhou sozinho pela internet da época e deixou milhares de máquinas lentas. Foi um dos motivos para a criação do primeiro CERT, o time de resposta a incidentes.', atributo: 'defesa' },
  { titulo: 'Três jeitos de provar quem você é', texto: 'Autenticação forte mistura categorias: **algo que você sabe** (senha), **algo que você tem** (celular, chave física) e **algo que você é** (digital, rosto). Duas senhas não são dois fatores.', atributo: 'defesa' },
  { titulo: 'O primeiro spam', texto: 'Em 1978, um vendedor da DEC mandou um anúncio de computadores para centenas de pessoas na **ARPANET**. É considerado o primeiro spam da história, e já levou bronca na época.', atributo: 'social' },
  { titulo: 'Senha campeã', texto: 'Ano após ano, **123456** aparece no topo das listas de senhas mais encontradas em vazamentos. Gerenciador de senhas existe para você nunca mais ser estatística.', atributo: 'defesa' },
  { titulo: 'Log é diário de bordo', texto: 'Na perícia, **horário** é tudo: logs de máquinas diferentes só se encaixam se os relógios estiverem sincronizados, por isso servidor sério usa **NTP**.', atributo: 'forense' },
];

function livraria(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Livraria do Protocolo', conteudo);
  if (jaFez('livro')) {
    conteudo.append(p('Dona Firmina: Você já levou o livro do dia, meu bem. Leitura demais sem dormir vira buffer overflow na cabeça.'), voltaDepois('Dona Firmina'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  const s = estado();
  const lidos = s.flags.filter((f) => f.startsWith('livro:')).map((f) => f.slice(6));
  const opcoes = LIVROS.filter((l) => !lidos.includes(l.titulo));
  const livro = sorteia(opcoes.length ? opcoes : LIVROS);
  conteudo.append(
    p('Dona Firmina: Chegou um volume novo. Senta, lê aqui mesmo que eu não cobro aluguel de cadeira.'),
    h('div', { class: 'vila-livro' }, h('b', {}, livro.titulo), p(livro.texto)),
    botao('Fechar o livro', () => {
      marcar('livro');
      if (!lidos.includes(livro.titulo)) s.flags.push('livro:' + livro.titulo);
      aviso(aplicar({ xp: 10, atributos: { [livro.atributo]: 1 } }));
      fechar();
    }, 'primario'),
  );
}

// ---------------------------------------------------------------- pegadinhas: é golpe?

const CASOS: { msg: string; golpe: boolean; porque: string }[] = [
  { msg: 'SMS: "Seu CPF será CANCELADO hoje. Regularize em bit.ly/regulariza-cpf-agora"', golpe: true, porque: 'Urgência, ameaça e link encurtado. Órgão público não manda link por SMS para "regularizar" CPF.' },
  { msg: 'E-mail do "banco": "Responda esta mensagem com sua senha e o código do token para confirmar seu cadastro."', golpe: true, porque: 'Banco nunca pede senha nem código de token. Ninguém legítimo pede.' },
  { msg: 'Dentro do app oficial do banco, que você abriu sozinho, aparece a compra que você fez ontem na padaria.', golpe: false, porque: 'Você mesmo abriu o app oficial e a informação bate com o que você fez. Esse é o canal certo.' },
  { msg: 'WhatsApp de número desconhecido: "Oi mãe, troquei de número, me faz um Pix urgente que depois explico?"', golpe: true, porque: 'Clássico do número novo. Liga para o número antigo da pessoa antes de mandar qualquer centavo.' },
  { msg: 'Site com cadeado no endereço paranapiacaba.edu.br.premio-gratis.xyz pedindo seu login da escola.', golpe: true, porque: 'O domínio de verdade é o final do endereço: premio-gratis.xyz. O cadeado só diz que a conexão é cifrada, até com o golpista.' },
  { msg: 'Ligação do "suporte técnico": "Instale este app de acesso remoto para eu proteger sua conta."', golpe: true, porque: 'Acesso remoto entrega o seu computador inteiro. Suporte de verdade não liga do nada pedindo isso.' },
  { msg: 'E-mail da secretaria, do endereço de sempre, lembrando a prova de sexta, sem link e sem anexo.', golpe: false, porque: 'Remetente conhecido, nada para clicar nem baixar, e a informação você confere no mural. Tranquilo.' },
  { msg: 'Boleto da internet chega por e-mail; no app do banco, o beneficiário aparece como "Fulano Pagamentos ME".', golpe: true, porque: 'O nome do beneficiário no app tem que ser a empresa. Se não bate, o boleto foi trocado.' },
  { msg: 'Anúncio: "Celular top de linha por R$ 99, só hoje, restam 3 unidades!"', golpe: true, porque: 'Preço impossível mais pressa artificial. A pressa é para você não pensar.' },
  { msg: 'Chega um código de verificação por SMS que você não pediu. Em seguida alguém liga pedindo para você ler o código.', golpe: true, porque: 'Esse código é a chave da sua conta (WhatsApp, banco). Nunca leia para ninguém.' },
  { msg: 'O site da loja que você sempre usa avisa que vai trocar a política de devolução, e você confere entrando pelo endereço que digitou.', golpe: false, porque: 'Você mesmo digitou o endereço e só leu um aviso. Sem pedido de dado, sem link estranho.' },
];

function pegadinhas(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Pegadinhas de Rede Ltda', conteudo);
  if (jaFez('golpe')) {
    conteudo.append(p('Juca: Por hoje chega de golpe, senão você fica desconfiado até do pão de queijo.'), voltaDepois('Juca'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  const casos = embaralha([...CASOS]).slice(0, 3);
  let i = 0;
  let acertos = 0;
  const mostra = () => {
    conteudo.innerHTML = '';
    if (i >= casos.length) {
      marcar('golpe');
      conteudo.append(p(`Juca: ${acertos} de ${casos.length}! ${acertos === casos.length ? 'Você não cai nem em pegadinha de 1º de abril.' : 'Quem erra aqui erra de graça. Lá fora custa caro.'}`));
      aviso(aplicar({ xp: 5 + acertos * 5, atributos: { defesa: acertos >= 2 ? 1 : 0, social: acertos === casos.length ? 1 : 0 } }).filter((t) => !t.startsWith('+0')));
      conteudo.append(botao('Valeu, Juca', fechar, 'primario'));
      return;
    }
    const c = casos[i];
    conteudo.append(p(`Juca: Caso ${i + 1} de ${casos.length}. É golpe ou não é?`), h('div', { class: 'vila-mensagem' }, c.msg));
    const responde = (golpe: boolean) => {
      const certo = golpe === c.golpe;
      if (certo) acertos++;
      conteudo.querySelectorAll('button').forEach((b) => b.remove());
      conteudo.append(p(`${certo ? '✔ Isso!' : '✘ Ops.'} ${c.golpe ? 'É golpe.' : 'É legítimo.'} ${c.porque}`), botao('Próximo', () => {
        i++;
        mostra();
      }, 'primario'));
    };
    conteudo.append(h('div', { class: 'acoes-col' }, botao('É golpe', () => responde(true), 'primario'), botao('É legítimo', () => responde(false), 'secundario')));
  };
  mostra();
}

// ---------------------------------------------------------------- teclados: teste de digitação de comandos

const COMANDOS: { cmd: string; diz: string }[] = [
  { cmd: 'ls -la', diz: 'lista tudo da pasta, até o que está escondido' },
  { cmd: 'whoami', diz: 'mostra com qual usuário você está' },
  { cmd: 'ping -c 4 castelo', diz: 'manda 4 pings para ver se o castelo responde' },
  { cmd: 'cat /etc/hosts', diz: 'mostra o arquivo de nomes locais' },
  { cmd: 'grep -i erro log.txt', diz: 'procura "erro" no log, sem ligar para maiúscula' },
  { cmd: 'chmod 600 segredo.txt', diz: 'deixa o arquivo só para você ler e escrever' },
  { cmd: 'ip addr', diz: 'mostra seus endereços de rede' },
  { cmd: 'sha256sum convite.pdf', diz: 'calcula a impressão digital do arquivo' },
];

function teclados(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Teclados & Cabos da Serra', conteudo);
  if (jaFez('teclado')) {
    conteudo.append(p('Seu Kenji: Esse teclado já te conhece. Deixa ele descansar as teclas até o próximo fim de semana.'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  const c = sorteia(COMANDOS);
  const inp = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'comando' }) as HTMLInputElement;
  const inicio = performance.now();
  const form = h('form', { class: 'term-linha' }, h('span', { class: 'term-prompt' }, 'teste@kenji:~$ '), inp);
  conteudo.append(
    p(`Seu Kenji: Teclado bom é teclado testado. Digita este comando, que ${c.diz}:`),
    h('div', { class: 'vila-mensagem term' }, c.cmd),
    h('div', { class: 'term grande' }, form),
  );
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const seg = (performance.now() - inicio) / 1000;
    if (inp.value.trim() !== c.cmd) {
      conteudo.append(p('Seu Kenji: Quase! Terminal não perdoa nem espaço a mais. Tenta de novo.'));
      inp.value = '';
      return;
    }
    marcar('teclado');
    form.remove();
    const rapido = seg < 8;
    conteudo.append(p(`Seu Kenji: ${seg.toFixed(1)} segundos! ${rapido ? 'O teclado acendeu sozinho. Ele gostou de você.' : 'Sem pressa: no terminal, certo vale mais que rápido.'}`), botao('Valeu, Seu Kenji', fechar, 'primario'));
    aviso(aplicar({ xp: rapido ? 15 : 8, atributos: { sistemas: 1 } }));
  });
  setTimeout(() => inp.focus(), 50);
}

// ---------------------------------------------------------------- doceria: brigadeiro surpresa com figurinha

function doceria(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Doceria Byte Doce', conteudo);
  if (jaFez('doce')) {
    conteudo.append(p('Dona Lurdinha: Um brigadeiro surpresa por fim de semana, meu anjo. Açúcar demais trava até processador.'), voltaDepois('Dona Lurdinha'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  const s = estado();
  const doAno = ANOS.slice(0, s.pos.ano + 1).flatMap((a) => a.figurinhas ?? []).map((f) => f.id);
  const faltam = doAno.filter((id) => !s.figurinhas.includes(id) && FIGURINHAS.has(id));
  conteudo.append(p('Dona Lurdinha: Brigadeiro Surpresa de 64 bits! Cada um vem com uma figurinha de gente que fez história na computação. Abre aí.'));
  conteudo.append(botao('Abrir o brigadeiro', () => {
    marcar('doce');
    conteudo.querySelectorAll('button').forEach((b) => b.remove());
    if (!faltam.length) {
      conteudo.append(p('Dentro só tem granulado. Você já tem todas as figurinhas que existem até agora. A Dona Lurdinha te dá outro de consolação.'), botao('Valeu!', fechar, 'primario'));
      aviso(aplicar({ xp: 5 }));
      return;
    }
    const f = FIGURINHAS.get(sorteia(faltam))!;
    conteudo.append(h('div', { class: 'vila-livro' }, h('b', {}, `${f.nome} (${f.ano})`), p(f.texto)), botao('Colar no álbum', fechar, 'primario'));
    aviso(aplicar({ xp: 5, figurinha: f.id }));
  }, 'primario'));
}

// ---------------------------------------------------------------- correio: carta para a Vó Cida

const RESPOSTAS_VO = [
  'Querid{o/a/e}, recebi sua carta. O pombo comeu metade do envelope mas o importante chegou. O roteador continua de cabeça para baixo e funcionando, não mexe. Beijo da Vó.',
  'Meu amor, a vizinha recebeu uma mensagem dizendo que ganhou um carro. Eu falei: ninguém ganha carro, Dona Neide. Aprendi com você. Estuda direitinho. Vó Cida.',
  'Oi, coração. Mudei a senha do Wi-Fi como você ensinou. Agora ninguém entra, nem eu. Manda instrução de novo, com letra grande. Vó.',
  'Querid{o/a/e}, fiz bolo de fubá e guardei um pedaço no congelador para quando você vier. Ele está protegido com senha de seis dígitos: o seu aniversário. Brincadeira. Beijo, Vó Cida.',
  'Meu bem, o pombo chegou cansado e eu dei água e farelo. Ele ficou. Agora tenho um pombo. O nome dele é Backup. Vó.',
];

function correio(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Correio de Pombos', conteudo);
  const s = estado();
  const pendente = s.flags.find((f) => f.startsWith('carta_vo:'));
  if (pendente) {
    const [, ano, cap] = pendente.split(':').map(Number);
    if (ano !== s.pos.ano || cap !== s.pos.cap) {
      s.flags = s.flags.filter((f) => f !== pendente);
      salvar();
      const n = s.flags.filter((f) => f === 'carta_vo_lida').length;
      s.flags.push('carta_vo_lida');
      conteudo.append(p('Seu Oswaldo: Chegou resposta! O pombo voltou com cara de quem comeu bolo.'), h('div', { class: 'vila-livro' }, p(personaliza(RESPOSTAS_VO[n % RESPOSTAS_VO.length]))), botao('Guardar a carta', fechar, 'primario'));
      aviso(aplicar({ amizade: { vo_cida: 1 } }));
      return;
    }
    conteudo.append(p('Seu Oswaldo: Sua carta ainda está voando. Pombo tem latência alta, mas entrega garantida. Passa de novo no próximo fim de semana.'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  conteudo.append(
    p('Seu Oswaldo: Correio de Pombos, criptografia de ponta a ponta e atraso de fábrica. Vai mandar carta?'),
    botao('Mandar uma carta para a Vó Cida', () => {
      s.flags.push(`carta_vo:${s.pos.ano}:${s.pos.cap}`);
      salvar();
      conteudo.querySelectorAll('button').forEach((b) => b.remove());
      conteudo.append(p('O pombo pega a carta, faz um handshake com você e sai voando pela janela. A resposta chega no próximo fim de semana.'), botao('Tchau', fechar, 'primario'));
    }, 'primario'),
  );
}

// ---------------------------------------------------------------- vagão: fofoca do Seu Zé

const FOFOCAS = [
  'Dizem que o Prof. Otávio tem um terminal escondido na gaveta que roda Windows 95. E que funciona.',
  'O Baltazar jura que uma criatura-malware fugiu do viveiro e foi morar no roteador da padaria. Por isso o Wi-Fi do pão de queijo cai às três da tarde.',
  'Sabia que a Diretora Iolanda guarda todos os post-its desde 1998? Ela diz que é backup. Eu digo que é acumulação.',
  'O Enzo tentou pagar um quentão com "crédito de nuvem". Eu não aceito nuvem, só Pix e moeda de chocolate.',
  'A torre do relógio atrasa dois minutos por semana. A Profa. Ruth diz que é falta de NTP. O relógio diz que é charme.',
];

function vagao(janela: Janela) {
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Vagão do Seu Zé', conteudo);
  conteudo.append(p(`Seu Zé: ${sorteia(FOFOCAS)}`), p('Seu Zé: E o quentão você pede ali no balcão, que hoje está no ponto.'), botao('Valeu, Seu Zé', fechar, 'primario'));
}

/** quem atende na vila e o que faz; devolve false se o personagem não é da vila */
export function atenderNaVila(id: string, lugar: string, janela: Janela): boolean {
  if (id === 'seu_ze' && lugar !== 'vila_vagao') return false;
  const f = ({ vila_lurdinha: doceria, vila_kenji: teclados, vila_firmina: livraria, vila_oswaldo: correio, vila_juca: pegadinhas, seu_ze: vagao } as Record<string, (j: Janela) => void>)[id];
  if (!f) return false;
  f(janela);
  return true;
}
