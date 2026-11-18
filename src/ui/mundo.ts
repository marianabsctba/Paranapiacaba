// Modo livre: andar pelo castelo em primeira pessoa, conversar, usar a varinha e seguir o objetivo.
import type { Lugar } from '../conteudo/tipos';
import { ANOS, FEITICOS, ITENS, LUGARES, PERSONAGENS } from '../conteudo/index';
import { estado, salvar } from '../motor/estado';
import { aplicar, lugaresVisiveis, nivel, titulo, xpDoNivel } from '../motor/progresso';
import { CASA_INFO, fmt, personaliza } from '../motor/texto';
import { brasao } from '../arte/brasao';
import * as C3 from '../tres/cena3d';
import { J, OLHO, soltarMouse, travado } from '../tres/jogador';
import { M } from '../tres/motor3d';
import { imgFoto } from '../tres/foto';
import { aviso, botao, h } from './dom';
import { atenderNaVila } from './vila';
import { conviteCapturebol } from './capturebol';
import * as Som from '../motor/som';
import { lancarEfeito } from '../tres/efeitos';

interface Acoes {
  menu: () => void;
  historia: () => void;
}

let laco: number | undefined;
let teclaE: ((e: KeyboardEvent) => void) | null = null;
const conversados = new Set<string>();

const FALAS_AMIGOS = [
  'Bora estudar depois do jantar? Eu levo o café, você leva a paciência.',
  'Dizem que tem segredo escondido nas salas. Já tentou a varinha?',
  'Se o Wi-Fi cair de novo, eu vou morar no Data Center com o Seu Zé.',
  'Eu fiz uma planilha das nossas notas. Não pergunta por que tem gráfico de pizza.',
  'O Bitu pisou no meu teclado e agora meu terminal só fala em hexadecimal.',
  'Você viu o Enzo? Ele disse que vai ganhar a Taça "por mérito do pai".',
  'Revisar aula no Boletim dá estrela. Eu revisei três vezes. Por ansiedade.',
];
const FALAS_ADULTOS = [
  'Revisão é o backup do cérebro, {nome}.',
  'Andando pelo castelo a essa hora? Pelo menos ande com a varinha atualizada.',
  'Quem não lê o log, lê a manchete no dia seguinte.',
  'Já fez a aula de hoje? O quadro não se apaga sozinho.',
];
const FALAS_FIGURANTES = [
  'Você também perdeu o pombo do correio hoje?',
  'Dizem que o Bitu tem acesso root ao castelo inteiro.',
  'Eu ainda não entendi a diferença entre switch e roteador, mas finjo muito bem.',
  'Minha senha era o nome do meu cachorro. Era. Depois da aula, mudei tudo.',
  'Alguém sabe onde fica a tomada boa do dormitório?',
];

function objetivo(): { capTitulo: string; lugar?: Lugar; anoNum: number } | null {
  const s = estado();
  const ano = ANOS[s.pos.ano];
  const cap = ano?.capitulos[s.pos.cap];
  if (!cap) return null;
  const resto = cap.passos.slice(s.pos.passo);
  const p = resto.find((x) => 'lugar' in x) as { lugar?: string } | undefined;
  return { capTitulo: personaliza(cap.titulo), lugar: p?.lugar ? LUGARES.get(p.lugar) : undefined, anoNum: ano.numero };
}

export function pararMundo() {
  if (laco) clearInterval(laco);
  laco = undefined;
  if (teclaE) removeEventListener('keydown', teclaE);
  teclaE = null;
  J.livre = false;
  soltarMouse();
}

export async function abrirMundo(app: HTMLElement, acoes: Acoes) {
  pararMundo();
  const s = estado();
  app.innerHTML = '';
  app.className = 'modo-mundo';
  M.ativo = true;
  const obj = objetivo();
  const destino = s.onde && LUGARES.has(s.onde) ? s.onde : obj?.lugar?.id ?? 'patio';
  await C3.irPara(destino, true);
  J.livre = true;

  const n = nivel(s.xp);
  const pct = ((s.xp - xpDoNivel(n)) / (xpDoNivel(n + 1) - xpDoNivel(n))) * 100;
  const casa = s.casa ? CASA_INFO[s.casa] : null;
  const nomeLugar = h('div', { class: 'hud-lugar' }, LUGARES.get(C3.C.lugarId)?.nome ?? '');
  const perfil = h('div', { class: 'hud-perfil hud-painel' },
    h('div', { class: 'hud-foto' }, imgFoto(s.aparencia.modelo ?? 'voce1', 'foto', C3.tintaDe('voce'))),
    h('div', {}, h('b', {}, s.nome, s.casa ? h('span', { class: 'hud-brasao', html: brasao(s.casa, 18) }) : null), h('div', { class: 'hud-titulo' }, personaliza(titulo(s.xp))),
      h('div', { class: 'nivel' }, h('span', {}, `Nv ${n}`), h('div', { class: 'barra' }, h('div', { style: `width:${pct.toFixed(1)}%` }))),
      casa ? h('div', { class: 'hud-casa' }, `${casa.nome} · ${s.pontosCasa[s.casa!]} pts`) : null));
  const botoes = h('div', { class: 'hud-botoes' },
    botao('☰', () => acoes.menu(), 'redondo'),
    botao('⌨', () => varinha(), 'redondo'),
    botao('🗺', () => mapa(), 'redondo'));
  botoes.children[0].setAttribute('aria-label', 'Menu');
  botoes.children[1].setAttribute('aria-label', 'Varinha');
  botoes.children[2].setAttribute('aria-label', 'Mapa');

  const card = h('div', { class: 'hud-objetivo hud-painel' });
  const desenhaObjetivo = () => {
    card.innerHTML = '';
    if (!obj) {
      card.append(h('div', { class: 'materia' }, s.formatura ? 'Formatura concluída' : 'Em breve'), h('div', {}, s.formatura ? 'Explore o castelo atrás dos segredos.' : 'O próximo ano ainda está sendo escrito.'));
      return;
    }
    const aqui = !obj.lugar || obj.lugar.id === C3.C.lugarId;
    card.append(h('div', { class: 'materia' }, `${obj.anoNum}º ano · capítulo ${s.pos.cap + 1}`), h('div', { class: 'obj-titulo' }, obj.capTitulo));
    if (aqui) card.append(botao(s.pos.passo > 0 ? '▶ Continuar história' : '▶ Começar capítulo', () => acoes.historia(), 'primario'));
    else card.append(h('div', { class: 'dica' }, `Vá para: ${obj.lugar!.nome}`), botao('Ir até lá', async () => {
      await C3.irPara(obj.lugar!.id, true);
      nomeLugar.textContent = obj.lugar!.nome;
      desenhaObjetivo();
    }, 'primario'));
  };
  desenhaObjetivo();

  const mira = h('div', { class: 'mira' });
  const prompt = h('button', { class: 'hud-interagir', type: 'button', hidden: true });
  const fala = h('div', { class: 'hud-fala hud-painel', hidden: true });
  const ajuda = h('div', { class: 'hud-ajuda' }, J.toque ? 'Arraste à esquerda para andar e à direita para olhar.' : 'Clique na tela para olhar com o mouse · WASD anda · Shift corre · E interage · Esc solta o mouse');
  app.append(perfil, botoes, nomeLugar, card, mira, prompt, fala, ajuda);
  setTimeout(() => ajuda.classList.add('some'), 7000);

  // quentão de caramelo salgado: bigode de espuma na tela e um bônus por visita ao vagão
  let quentaoTomado = '';
  const quentao = () => {
    Som.quentao();
    const bigode = h('div', { class: 'bigode-espuma' });
    app.append(bigode);
    setTimeout(() => bigode.classList.add('some'), 6500);
    setTimeout(() => bigode.remove(), 8000);
    fala.hidden = false;
    const frases = [
      'Seu Zé: Quentão de caramelo salgado, sem álcool e com 0% de vulnerabilidade conhecida. Ainda.',
      'Seu Zé: Bebe devagar que a espuma é por conta da casa. O bigode também.',
      'Seu Zé: Esse aqui esquenta mais que servidor sem ar-condicionado em fevereiro.',
    ];
    fala.innerHTML = `<b style="color:#f2c45a">Vagão do Seu Zé</b><p>${frases[Math.floor(Math.random() * frases.length)]}</p>`;
    setTimeout(() => (fala.hidden = true), 5000);
    const visita = String(s.pos.ano) + ':' + String(s.pos.cap);
    if (quentaoTomado !== visita) {
      quentaoTomado = visita;
      aviso(aplicar({ xp: 5, atributos: { social: 1 } }));
    }
  };

  // malão: lista o que você tem e pendura ou guarda no seu canto do dormitório
  const malao3d = () => {
    const lista = h('div', { class: 'vila-loja' });
    janela('Malão', lista);
    const desenha = () => {
      lista.innerHTML = '';
      const itens = s.itens.map((id) => ITENS.get(id)).filter((x) => x);
      if (!itens.length) {
        lista.append(h('p', {}, 'Malão vazio. Só tem uma meia e um cabo USB que não serve em nada.'));
        return;
      }
      lista.append(h('p', { class: 'dica' }, 'O que estiver no seu canto aparece no quarto: pôster na parede, roupa no gancho, o resto nas prateleiras.'));
      for (const it of itens) {
        const no = s.enfeites.includes(it!.id);
        lista.append(h('div', { class: 'item' }, h('b', {}, it!.nome), h('p', { html: fmt(it!.descricao) }), botao(no ? 'Guardar no malão' : 'Colocar no quarto', () => {
          const i = s.enfeites.indexOf(it!.id);
          if (i >= 0) s.enfeites.splice(i, 1);
          else s.enfeites.push(it!.id);
          salvar();
          C3.atualizarEnfeites();
          desenha();
        }, 'mini')));
      }
    };
    desenha();
  };

  // sentar nos bancos e cadeiras do lugar (refeitório, sala, arquibancada)
  let sentado: { x: number; z: number; ry: number } | null = null;
  const assentoPerto = () => {
    const a = C3.C.area;
    if (!a?.assentos) return null;
    const ocupado = (p: { x: number; z: number }) => C3.C.figurantes.some((f) => Math.hypot(f.raiz.position.x - p.x, f.raiz.position.z - p.z) < 0.35);
    let melhor: { x: number; z: number; ry: number } | null = null;
    let d = 1.3;
    for (const p of a.assentos) {
      const dd = Math.hypot(p.x - J.pos.x, p.z - J.pos.z);
      if (dd < d && !ocupado(p)) {
        d = dd;
        melhor = p;
      }
    }
    return melhor;
  };
  const sentar = (p: { x: number; z: number; ry: number; y?: number }) => {
    sentado = p;
    J.pos.set(p.x, p.y ?? 0, p.z);
    J.yaw = p.ry + Math.PI;
    J.pitch = -0.1;
    J.olho = 1.02;
    J.voo = 0;
  };
  const levantar = () => {
    if (!sentado) return;
    // levanta para trás, longe da mesa, de volta ao corredor
    J.pos.set(sentado.x - Math.sin(sentado.ry) * 0.6, 0, sentado.z - Math.cos(sentado.ry) * 0.6);
    J.olho = OLHO;
    J.voo = 1;
    sentado = null;
  };

  let alvo: C3.Alvo = null;
  const interagir = () => {
    if (!J.livre) return;
    if (!alvo) {
      if (sentado) return levantar();
      const banco = assentoPerto();
      if (banco) sentar(banco);
      return;
    }
    if (alvo.tipo === 'porta') {
      const d = alvo.destino;
      if (!d) return mapa();
      if (d === 'acao:quentao') return quentao();
      if (d === 'acao:malao') return malao3d();
      void (async () => {
        await C3.irPara(d, true);
        nomeLugar.textContent = LUGARES.get(d)?.nome ?? '';
        desenhaObjetivo();
      })();
      return;
    }
    const id = alvo.h.id;
    if (atenderNaVila(id, C3.C.lugarId, janela)) return;
    if (id === 'bia' && C3.C.lugarId === 'campo') return conviteCapturebol(janela, app, () => desenhaObjetivo());
    const p = PERSONAGENS.get(id);
    const ehAmigo = ['tati', 'caua', 'bia', 'jonas', 'enzo'].includes(id);
    const pool = ehAmigo ? FALAS_AMIGOS : /^aluno/.test(id) ? FALAS_FIGURANTES : FALAS_ADULTOS;
    const txt = pool[Math.floor(Math.random() * pool.length)];
    alvo.h.olharPara(J.pos.x, J.pos.z);
    alvo.h.tocar('falando');
    const quem = p ? personaliza(p.nome) : 'Colega';
    fala.hidden = false;
    fala.innerHTML = `<b style="color:${p?.cor ?? '#ffd166'}">${quem}</b><p>${fmt(txt)}</p>`;
    const chave = `${C3.C.lugarId}:${id}`;
    if (p && !conversados.has(chave)) {
      conversados.add(chave);
      aviso(aplicar({ amizade: { [id]: 1 } }));
    }
    const hh = alvo.h;
    setTimeout(() => {
      fala.hidden = true;
      hh.tocar('parado');
    }, 4500);
  };
  prompt.addEventListener('click', interagir);
  teclaE = (e) => {
    if (e.code === 'KeyE') interagir();
  };
  addEventListener('keydown', teclaE);
  laco = window.setInterval(() => {
    if (!J.livre) return;
    // trocou de lugar sentado: levanta sozinho
    if (sentado && Math.hypot(J.pos.x - sentado.x, J.pos.z - sentado.z) > 0.5) {
      sentado = null;
      J.olho = OLHO;
      J.voo = 1;
    }
    alvo = sentado ? null : C3.alvoNaMira();
    // perto de um lugar livre, sentar ganha de puxar papo com quem já está sentado
    if (alvo?.tipo === 'npc' && alvo.h.sentado && assentoPerto()) alvo = null;
    if (!alvo) {
      // sem ninguém na mira: oferece sentar no banco mais perto, ou levantar
      const banco = sentado ? null : assentoPerto();
      if (sentado || banco) {
        prompt.hidden = false;
        prompt.textContent = `${J.toque ? '👆' : 'E'} · ${sentado ? 'Levantar' : 'Sentar'}`;
      } else prompt.hidden = true;
      mira.classList.remove('ativa');
      return;
    }
    mira.classList.add('ativa');
    prompt.hidden = false;
    const nome = alvo.tipo === 'npc' ? personaliza(PERSONAGENS.get(alvo.h.id)?.nome ?? 'colega') : alvo.rotulo;
    prompt.textContent = `${J.toque ? '👆' : 'E'} · ${alvo.tipo === 'npc' ? `Falar com ${nome}` : nome}`;
  }, 150);

  // ---------------------------------------------------------------- mapa e varinha

  function janela(titulo: string, ...conteudo: Node[]) {
    J.livre = false;
    if (travado()) soltarMouse();
    const fechar = () => {
      box.remove();
      J.livre = true;
    };
    const box = h('div', { class: 'hud-janela hud-painel' }, h('header', {}, h('h2', {}, titulo), botao('✕', fechar, 'redondo')), ...conteudo);
    app.append(box);
    return { box, fechar };
  }

  function mapa() {
    const ls = lugaresVisiveis();
    const { fechar } = janela('Para onde?', h('div', { class: 'grade' }, ...ls.map((l) => {
      const tot = l.segredos?.length ?? 0;
      const ach = (l.segredos ?? []).filter((_, i) => s.segredos.includes(`${l.id}#${i}`)).length;
      const ehObj = obj?.lugar?.id === l.id;
      return h('button', { class: `card ${ehObj ? 'objetivo' : ''} ${l.id === C3.C.lugarId ? 'aqui' : ''}`, type: 'button', onclick: async () => {
        fechar();
        await C3.irPara(l.id, true);
        nomeLugar.textContent = l.nome;
        desenhaObjetivo();
      } }, h('b', {}, l.nome), h('small', {}, ehObj ? '★ objetivo' : tot ? `segredos ${ach}/${tot}` : ' '));
    })));
  }

  function varinha() {
    const l = LUGARES.get(C3.C.lugarId);
    if (!l) return;
    const prompt = `${s.nome.toLowerCase().replace(/[^a-z0-9]/g, '') || 'aluno'}@${l.id}:~$`;
    const tela = h('div', { class: 'term grande' });
    const linha = h('form', { class: 'term-linha' });
    const inp = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'comando', enterkeyhint: 'go' }) as HTMLInputElement;
    linha.append(h('span', { class: 'term-prompt' }, prompt + ' '), inp);
    const saida = (t: string, classe = '') => tela.insertBefore(h('pre', { class: classe }, t), linha);
    const tot = l.segredos?.length ?? 0;
    tela.append(h('pre', { class: 'term-dica' }, `# Varinha conectada em ${l.nome}. ${tot ? `${tot} segredo(s) aqui.` : 'Nada parece escondido aqui.'} Digite "ajuda".`), linha);
    // o terminal da varinha fica embaixo, para o feitiço aparecer no castelo em cima
    janela('Varinha', tela).box.classList.add('compacta');
    const aprendidos = s.feiticos.map((id) => FEITICOS.get(id)).filter((f) => f) as NonNullable<ReturnType<typeof FEITICOS.get>>[];
    const base = (c: string) => c.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
    linha.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const cmd = inp.value.trim();
      inp.value = '';
      if (!cmd) return;
      saida(`${prompt} ${cmd}`);
      const b = base(cmd);
      if (b === 'ajuda' || b === 'help') return void saida(aprendidos.length ? 'Feitiços que você sabe:\n' + aprendidos.map((f) => `  ${f.comando.padEnd(22)} ${f.nome}`).join('\n') : 'Você ainda não aprendeu feitiços. Vai pra aula, criatura.');
      if (b === 'clear' || b === 'cls') return void tela.querySelectorAll('pre').forEach((p) => p.remove());
      if (b === 'whoami') lancarEfeito('whoami', s.nome, false);
      if (b === 'sudo') lancarEfeito('sudo', s.nome, false);
      if (b === 'whoami') return void saida(`${s.nome} (${s.casa ? CASA_INFO[s.casa].nome : 'sem casa'}), nível ${nivel(s.xp)}`);
      if (b === 'sudo') return void saida(`${s.nome} não está no arquivo sudoers. Este incidente será reportado à Diretora Iolanda.`, 'term-erro');
      if (/^rm\s+-rf\s+\/\s*$/.test(cmd)) return void saida('Seu Zé do Rack apareceu do nada, tirou o teclado da sua mão e saiu sem dizer uma palavra.', 'term-erro');
      const f = aprendidos.find((x) => base(x.comando) === b);
      if (!f) {
        const existe = [...FEITICOS.values()].some((x) => base(x.comando) === b);
        return void saida(existe ? 'Você ainda não aprendeu esse feitiço. A varinha faz um barulhinho de erro do Windows 98.' : `${b}: comando não encontrado. O Bitu pisou no teclado?`, 'term-erro');
      }
      const segs = (l.segredos ?? []).map((sg, i) => ({ sg, i })).filter((x) => x.sg.feitico === f.id);
      lancarEfeito(cmd, s.nome, segs.some(({ i }) => !s.segredos.includes(`${l.id}#${i}`)));
      if (!segs.length) return void saida(`${f.nome}! O feitiço sai bonito, mas nada nesta sala reage.`);
      for (const { sg, i } of segs) {
        const k = `${l.id}#${i}`;
        if (s.segredos.includes(k)) {
          saida(`${f.nome}! (você já achou isto) ${personaliza(sg.texto)}`);
          continue;
        }
        s.segredos.push(k);
        salvar();
        saida(`${f.nome}! ✦ ${personaliza(sg.texto)}`, 'term-saida');
        aviso(aplicar({ xp: 20, ...(sg.efeito ?? {}) }));
      }
      tela.scrollTop = tela.scrollHeight;
    });
    setTimeout(() => inp.focus(), 60);
  }
}
