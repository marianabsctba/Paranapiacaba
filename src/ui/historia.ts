// Palco da história: falas, aulas, escolhas, desafios, duelos, seleção e fim de ano.
import type { Capitulo, CasaId, Exercicio, Fala, Passo, PassoAula, PassoDuelo } from '../conteudo/tipos';
import { partida } from './capturebol';
import { ANOS, LUGARES, PERSONAGENS } from '../conteudo/index';
import { CASAS, estado, salvar, zeraPontos } from '../motor/estado';
import { aplicar, nivel, pontuarRivais, ranking, titulo } from '../motor/progresso';
import { CASA_INFO, esc, fmt, personaliza } from '../motor/texto';
import * as C3 from '../tres/cena3d';
import { J, soltarMouse } from '../tres/jogador';
import { M } from '../tres/motor3d';
import { modeloDoLugar } from '../tres/areas';
import { imgFoto } from '../tres/foto';
import { brasao } from '../arte/brasao';
import { aviso, botao, espera, h } from './dom';
import { mostrarExercicio } from './exercicio';

let geracao = 0;
let palco: { raiz: HTMLElement; ret: HTMLElement; caixa: HTMLElement; painel: HTMLElement; local: HTMLElement } | null = null;
let voltar: () => void = () => {};

export function aoSair(f: () => void) {
  voltar = f;
}
export function cancelarHistoria() {
  geracao++;
  palco = null;
  C3.remontar();
}

function montar(app: HTMLElement, cap: Capitulo, anoNum: number) {
  app.innerHTML = '';
  app.className = 'modo-historia';
  M.ativo = true;
  J.livre = false;
  soltarMouse();
  const ret = h('div', { class: 'retrato' });
  const caixa = h('div', { class: 'caixa' });
  const painel = h('div', { class: 'painel', hidden: true });
  const local = h('div', { class: 'local' });
  const topo = h(
    'header',
    { class: 'topo-hist' },
    botao('← Castelo', () => {
      cancelarHistoria();
      voltar();
    }, 'mini'),
    h('span', { class: 'cap-titulo' }, `Ano ${anoNum} · ${cap.mes} · ${cap.titulo}`),
  );
  const raiz = h('div', { class: 'palco' }, topo, local, ret, caixa, painel);
  app.append(raiz);
  palco = { raiz, ret, caixa, painel, local };
}

async function lugar(id: string) {
  if (!palco) return;
  const l = LUGARES.get(id);
  palco.local.textContent = l?.nome ?? '';
  await C3.irPara(id);
  // refeitório e trem nunca ficam vazios
  await C3.encenar(C3.momentoDoLugar());
}

/** espera um toque no palco ou Enter/Espaço */
function toque(g: number): Promise<void> {
  return new Promise((r) => {
    const p = palco;
    if (!p) return;
    const fim = () => {
      p.raiz.removeEventListener('click', clique);
      document.removeEventListener('keydown', tecla);
      if (g === geracao) r();
    };
    const clique = (e: Event) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest('.topo-hist') || alvo.closest('.painel')) return;
      fim();
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fim();
      }
    };
    p.raiz.addEventListener('click', clique);
    document.addEventListener('keydown', tecla);
  });
}

async function falar(falas: Fala[], g: number) {
  for (const [quem, txt] of falas) {
    if (g !== geracao || !palco) return;
    const p = PERSONAGENS.get(quem);
    const nome = quem === 'narrador' ? '' : personaliza(p?.nome ?? quem);
    await C3.foco(quem, txt);
    if (!palco) return;
    palco.caixa.className = `caixa ${quem === 'narrador' ? 'narracao' : ''}`;
    palco.caixa.innerHTML = '';
    if (nome) palco.caixa.append(h('div', { class: 'nome', style: `color:${p?.cor ?? '#fff'}` }, nome));
    palco.caixa.append(h('div', { class: 'fala', html: fmt(txt) }), h('div', { class: 'seta' }, '▼'));
    await toque(g);
  }
}

function abrirPainel(): HTMLElement {
  const p = palco!;
  p.painel.hidden = false;
  p.painel.innerHTML = '';
  p.painel.scrollTop = 0;
  p.caixa.hidden = true;
  p.ret.hidden = true;
  return p.painel;
}
function fecharPainel() {
  if (!palco) return;
  palco.painel.hidden = true;
  palco.caixa.hidden = false;
  palco.ret.hidden = false;
}

const clique = (el: HTMLElement, texto: string, classe = 'primario') =>
  new Promise<void>((r) => el.append(botao(texto, () => r(), classe)));

// ---------------------------------------------------------------- passos

async function escolha(p: Extract<Passo, { tipo: 'escolha' }>, g: number) {
  await lugar(p.lugar);
  const painel = abrirPainel();
  painel.classList.add('escolha');
  painel.append(h('h3', { html: fmt(p.pergunta) }));
  const i = await new Promise<number>((r) => p.opcoes.forEach((o, k) => painel.append(h('button', { class: 'opcao', type: 'button', onclick: () => r(k), html: fmt(o.texto) }))));
  painel.classList.remove('escolha');
  fecharPainel();
  if (g !== geracao) return;
  aviso(aplicar(p.opcoes[i].efeito));
  await falar(p.opcoes[i].resposta, g);
}

function estrelasHtml(n: number, total = 3) {
  return Array.from({ length: total }, (_, i) => `<span class="estrela ${i < n ? 'on' : ''}">★</span>`).join('');
}

export function notaEstrelas(acertos: number, total: number): number {
  const r = total ? acertos / total : 0;
  return r >= 0.9 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
}

/** roda uma aula. Em modo revisão (do boletim) só melhora a nota. */
// Aula só acontece em sala do castelo. Fora da escola (casa, galeria, trem, Secretaria) vira ensinamento,
// sem sala nem lousa. Dentro da escola mas fora de uma sala (refeitório, pátio), vai para a sala da matéria.
// salas do castelo onde a aula acontece no próprio lugar (as temáticas também contam)
const SALAS = ['aula', 'biblioteca', 'datacenter', 'torre', 'masmorra', 'persuasao', 'maquinas', 'comutacao', 'rastros', 'sinergia', 'reverso', 'tunel', 'crise', 'galpao', 'cabine', 'sandbox', 'viveiro', 'coletor', 'arquivo_dumps', 'arena', 'rotunda', 'lojalab', 'arbitragem', 'arquivo_backup', 'gabinete'];
const FORA_DA_ESCOLA = ['casa', 'cidade', 'trem', 'colunas', 'oficina', 'vila', 'frigorifico'];
export function ondeEnsina(p: PassoAula): { lugar: string; ensinamento: boolean } {
  const m = modeloDoLugar(LUGARES.get(p.lugar));
  if (FORA_DA_ESCOLA.includes(m)) return { lugar: p.lugar, ensinamento: true };
  if (SALAS.includes(m)) return { lugar: p.lugar, ensinamento: false };
  const mat = p.materia.toLowerCase();
  return { lugar: /rede/.test(mat) ? 'torre_redes' : /cripto/.test(mat) ? 'cripta' : 'lab_terminal', ensinamento: false };
}

export async function aula(p: PassoAula, g: number, revisao = false): Promise<void> {
  const onde = ondeEnsina(p);
  await lugar(onde.lugar);
  let painel = abrirPainel();
  painel.classList.add('escolha');
  const prof = PERSONAGENS.get(p.professor);
  painel.append(
    h('div', { class: 'aula-capa' },
      h('div', { class: 'aula-ret' }, imgFoto(p.professor, 'foto', C3.tintaDe(p.professor))),
      h('div', {}, h('div', { class: 'materia' }, onde.ensinamento ? `Ensinamento · ${p.materia}` : p.materia), h('h2', {}, personaliza(p.titulo)), h('div', { class: 'prof' }, prof ? personaliza(prof.nome) : ''),
        h('div', { class: 'estrelas', html: estrelasHtml(estado().aulas[p.id] ?? 0) }))),
  );
  await clique(painel, revisao ? (onde.ensinamento ? 'Ouvir de novo' : 'Refazer aula') : onde.ensinamento ? 'Ouvir' : 'Entrar na sala');
  painel.classList.remove('escolha');
  fecharPainel();
  if (!onde.ensinamento) await C3.modoAula(p);
  await falar(p.abertura, g);
  if (g !== geracao) return;

  painel = abrirPainel();
  painel.append(h('div', { class: 'materia' }, `${p.materia} · ${personaliza(p.titulo)}`), h('div', { class: 'quadro' }, ...p.explicacao.map((t) => h('p', { html: fmt(t) }))));
  await clique(painel, 'Entendi, bora praticar');
  if (g !== geracao) return;

  let acertos = 0;
  for (let i = 0; i < p.exercicios.length; i++) {
    painel = abrirPainel();
    const barra = h('div', { class: 'progresso-aula' }, h('span', {}, `Exercício ${i + 1} de ${p.exercicios.length}`), h('div', { class: 'estrelas', html: estrelasHtml(notaEstrelas(acertos, p.exercicios.length)) }));
    const alvo = h('div');
    painel.append(barra, alvo);
    if (await mostrarExercicio(alvo, p.exercicios[i])) acertos++;
    if (g !== geracao) return;
  }

  const s = estado();
  const antes = s.aulas[p.id] ?? -1;
  const nota = notaEstrelas(acertos, p.exercicios.length);
  const melhorou = nota > antes;
  if (melhorou) s.aulas[p.id] = nota;
  const ganho: string[] = [];
  if (!revisao) {
    ganho.push(...aplicar({ xp: 30 + nota * 15, pontosCasa: nota * 5, atributos: { [p.atributo]: nota + 1 } }));
    if (p.feitico) ganho.push(...aplicar({ feitico: p.feitico }));
  } else if (melhorou) {
    const delta = nota - Math.max(antes, 0);
    ganho.push(...aplicar({ xp: delta * 15, pontosCasa: delta * 5, atributos: { [p.atributo]: delta } }));
  }
  salvar();
  painel = abrirPainel();
  const frases = ['O professor nem olhou pro celular durante sua resposta. Respeito.', 'Passou raspando, igual boleto pago às 23h59.', 'Bom trabalho. Já pode colocar no LinkedIn com moderação.', 'Excelência! A sala inteira quer copiar seu caderno.'];
  painel.append(
    h('div', { class: 'resultado' },
      h('h2', {}, onde.ensinamento ? 'Ensinamento concluído' : 'Aula concluída'),
      h('div', { class: 'estrelas grandes', html: estrelasHtml(nota) }),
      h('p', {}, `${acertos} de ${p.exercicios.length} exercícios certos. ${frases[nota]}`),
      revisao && !melhorou ? h('p', { class: 'dica' }, 'Sua nota anterior era igual ou melhor, então ela fica.') : null,
      ...ganho.map((t) => h('div', { class: 'ganho' }, t))),
  );
  await clique(painel, 'Continuar');
  fecharPainel();
  if (!onde.ensinamento) C3.fimAula();
}

async function desafio(p: Extract<Passo, { tipo: 'desafio' }>, g: number) {
  await lugar(p.lugar);
  await falar(p.antes, g);
  if (g !== geracao) return;
  const painel = abrirPainel();
  painel.append(h('div', { class: 'desafio-titulo' }, '⚡ ' + personaliza(p.titulo)));
  const alvo = h('div');
  painel.append(alvo);
  const ok = await mostrarExercicio(alvo, p.exercicio);
  fecharPainel();
  aviso(aplicar(ok ? { xp: 40, pontosCasa: 10, atributos: { [p.atributo]: 2 } } : { xp: 10 }));
  await falar(p.depois, g);
}

const TEMPO: Record<Exercicio['tipo'], number> = { multipla: 30, lacuna: 45, terminal: 90, ligar: 75, ordenar: 60, achar: 60 };
const FEITICOS_DUELO = ['Firewallus!', 'Patchum Imediatum!', 'Rate Limitus!', 'Revogare Tokenum!', 'Multifatorium!', 'Isolare Hostus!'];

async function duelo(p: PassoDuelo, cap: Capitulo, idx: number, g: number) {
  await lugar(p.lugar);
  await falar(p.antes, g);
  if (g !== geracao) return;
  await C3.modoDuelo(p.oponente);
  let vidaVc = 100;
  let vidaOp = 100;
  const dano = Math.ceil(100 / Math.max(2, Math.ceil(p.rodadas.length * 0.6)));
  const op = PERSONAGENS.get(p.oponente);
  for (let i = 0; i < p.rodadas.length && vidaVc > 0 && vidaOp > 0; i++) {
    const painel = abrirPainel();
    const barras = h('div', { class: 'duelo' },
      h('div', { class: 'duelista' }, h('div', { class: 'vida' }, h('div', { class: 'vida-fill', style: `width:${vidaVc}%` })), h('span', {}, personaliza('{nome}'))),
      h('div', { class: 'raio', id: 'raio' }),
      h('div', { class: 'duelista op' }, h('div', { class: 'vida' }, h('div', { class: 'vida-fill', style: `width:${vidaOp}%` })), h('span', {}, personaliza(op?.nome ?? ''))));
    painel.append(h('div', { class: 'desafio-titulo' }, `⚔ ${personaliza(p.titulo)} · Rodada ${i + 1}`), barras);
    const alvo = h('div');
    painel.append(alvo);
    const ok = await mostrarExercicio(alvo, p.rodadas[i], { tempo: TEMPO[p.rodadas[i].tipo], rotuloContinuar: 'Lançar' });
    if (g !== geracao) return;
    painel.classList.add('transparente');
    await C3.raio(ok, p.oponente);
    painel.classList.remove('transparente');
    const raio = barras.querySelector('#raio') as HTMLElement;
    raio.textContent = ok ? FEITICOS_DUELO[i % FEITICOS_DUELO.length] : 'Ai!';
    raio.className = `raio ${ok ? 'vai' : 'volta'}`;
    if (ok) vidaOp = Math.max(0, vidaOp - dano);
    else vidaVc = Math.max(0, vidaVc - dano);
    (barras.querySelectorAll('.vida-fill')[0] as HTMLElement).style.width = `${vidaVc}%`;
    (barras.querySelectorAll('.vida-fill')[1] as HTMLElement).style.width = `${vidaOp}%`;
    await espera(900);
  }
  const venceu = vidaVc >= vidaOp;
  const s = estado();
  const chave = `${cap.id}#${idx}`;
  const ja = s.duelos[chave];
  s.duelos[chave] = venceu || !!ja;
  const painel = abrirPainel();
  painel.append(h('div', { class: 'resultado' }, h('h2', {}, venceu ? 'Vitória no duelo!' : 'Derrota honrosa'), h('p', {}, venceu ? 'O oponente fez cara de quem vai abrir chamado contra você.' : 'Perdeu, mas aprendeu. O log do duelo fica para estudar.')));
  aplicar(venceu ? { xp: 60, pontosCasa: 15, atributos: { [p.atributo]: 2 } } : { xp: 20 }).forEach((t) => painel.querySelector('.resultado')!.append(h('div', { class: 'ganho' }, t)));
  await clique(painel, 'Continuar');
  fecharPainel();
  C3.fimDuelo(p.oponente);
  await falar(venceu ? p.vitoria : p.derrota, g);
}

async function recompensa(p: Extract<Passo, { tipo: 'recompensa' }>) {
  const painel = abrirPainel();
  const ganhos = aplicar(p.efeito);
  painel.append(h('div', { class: 'resultado recompensa' }, h('div', { class: 'brilho' }, '✦'), h('p', { html: fmt(p.texto) }), ...ganhos.map((t) => h('div', { class: 'ganho' }, t))));
  await clique(painel, 'Guardar');
  fecharPainel();
}

// ---------------------------------------------------------------- seleção

const PERGUNTAS_SELECAO: { q: string; r: [string, CasaId][] }[] = [
  {
    q: 'O servidor da escola caiu às três da manhã. O que você faz?',
    r: [
      ['Vou até o data center de pijama e descubro o que derrubou', 'oncarina'],
      ['Leio o log inteiro antes de encostar em qualquer coisa', 'tucanal'],
      ['Aviso o plantão, abro chamado e passo um café para todo mundo', 'capivarias'],
      ['Convenço o fornecedor a resolver sem cobrar hora extra', 'jararacas'],
    ],
  },
  {
    q: 'Chega um e-mail dizendo que você ganhou um celular de última geração.',
    r: [
      ['Monto um laboratório isolado e abro o link lá dentro para estudar', 'oncarina'],
      ['Analiso o cabeçalho e descubro de onde veio de verdade', 'tucanal'],
      ['Aviso o grupo da família antes que a tia clique', 'capivarias'],
      ['Escrevo um alerta tão convincente quanto o golpe, só que do bem', 'jararacas'],
    ],
  },
  {
    q: 'Qual superpoder você escolheria?',
    r: [
      ['Abrir qualquer cadeado (com autorização por escrito)', 'oncarina'],
      ['Ler qualquer idioma, inclusive código legado sem comentário', 'tucanal'],
      ['Nunca perder a calma num incidente', 'capivarias'],
      ['Convencer qualquer pessoa a ativar a verificação em duas etapas', 'jararacas'],
    ],
  },
  {
    q: 'Festa da firma. Onde você está?',
    r: [
      ['No karaokê, cantando errado com convicção', 'oncarina'],
      ['Explicando DNS para o garçom, que pediu para eu parar', 'tucanal'],
      ['Ajudando a recolher os copos no fim', 'capivarias'],
      ['Fazendo networking com a diretoria entre um salgadinho e outro', 'jararacas'],
    ],
  },
];

async function selecao(g: number) {
  await lugar('refeitorio');
  await C3.encenar('selecao');
  await falar([
    ['narrador', 'O refeitório fica em silêncio. Em cima de um banquinho de madeira, um capacete de obra amarelo pisca dois LEDs azuis.'],
    ['chapeu', 'Boa noite, calouros. Eu sou o Capacete Classificador. Fui treinado em 1997 com 14 alunos e um disquete. Minha acurácia é de 100%, segundo eu mesmo.'],
    ['chapeu', 'Vou fazer quatro perguntas. Não existe resposta errada. Existe só resposta que eu vou julgar em silêncio.'],
  ], g);
  const votos: Record<CasaId, number> = { oncarina: 0, tucanal: 0, capivarias: 0, jararacas: 0 };
  for (const pr of PERGUNTAS_SELECAO) {
    if (g !== geracao) return;
    const painel = abrirPainel();
    painel.classList.add('escolha');
    painel.append(h('h3', {}, pr.q));
    const c = await new Promise<CasaId>((r) => pr.r.forEach(([t, casa]) => painel.append(h('button', { class: 'opcao', type: 'button', onclick: () => r(casa) }, t))));
    painel.classList.remove('escolha');
    votos[c]++;
  }
  const ordem = CASAS.slice().sort((a, b) => votos[b] - votos[a]);
  let casa = ordem[0];
  fecharPainel();
  await falar([['chapeu', `Hmm... processando... ventoinha girando... Eu vejo ${CASA_INFO[casa].valor}. Muita ${CASA_INFO[casa].valor}. Talvez demais. Gostei.`]], g);
  if (g !== geracao) return;
  const painel = abrirPainel();
  painel.classList.add('escolha');
  painel.append(h('div', { class: 'centro', html: brasao(casa, 96) }), h('h3', {}, `O Capacete sugere ${CASA_INFO[casa].nome}. ${CASA_INFO[casa].area}. "${CASA_INFO[casa].lema}"`),
    h('p', { class: 'instrucao' }, 'O Capacete aceita sugestão, igual estagiário em primeira semana.'));
  casa = await new Promise<CasaId>((r) => {
    painel.append(h('button', { class: 'opcao primeira', type: 'button', onclick: () => r(casa) }, `Aceitar ${CASA_INFO[casa].nome}`));
    for (const c of CASAS) if (c !== casa) painel.append(h('button', { class: 'opcao', type: 'button', onclick: () => r(c) }, `Prefiro ${CASA_INFO[c].nome} (${CASA_INFO[c].valor})`));
  });
  painel.classList.remove('escolha');
  fecharPainel();
  const s = estado();
  s.casa = casa;
  salvar();
  await falar([
    ['chapeu', `${CASA_INFO[casa].nome.toUpperCase()}!`],
    ['narrador', `A mesa de ${CASA_INFO[casa].nome} explode em aplausos, assobios e uma notificação de Bluetooth que ninguém assume.`],
  ], g);
}

// ---------------------------------------------------------------- fim de ano

async function fimDeAno(g: number) {
  const s = estado();
  await lugar('refeitorio');
  await falar([
    ['iolanda', 'Mais um ano letivo. Ninguém derrubou produção de propósito, o que já é um recorde.'],
    ['iolanda', 'Como dizia minha avó: quem tem backup tem tudo, e quem não tem, tem história para contar. Vamos à Taça das Casas.'],
  ], g);
  if (g !== geracao) return;
  const rk = ranking();
  const painel = abrirPainel();
  const max = Math.max(1, ...rk.map((x) => x[1]));
  painel.append(h('div', { class: 'resultado' }, h('h2', {}, '🏆 Taça das Casas'),
    ...rk.map(([c, v], i) => h('div', { class: `placar-linha ${c === s.casa ? 'minha' : ''}` },
      h('span', { html: brasao(c, 32) }), h('span', { class: 'placar-nome' }, `${i + 1}º ${CASA_INFO[c].nome}`),
      h('div', { class: 'placar-barra' }, h('div', { style: `width:${(v / max) * 100}%;background:${CASA_INFO[c].cor}` })), h('b', {}, String(v))))));
  await clique(painel, 'E a campeã é...');
  const campea = rk[0][0];
  s.tacas[s.pos.ano] = campea;
  salvar();
  fecharPainel();
  const minha = campea === s.casa;
  await falar([
    ['iolanda', `${CASA_INFO[campea].nome}! Parabéns. ${minha ? 'Pode comemorar, mas comemora com o Wi-Fi ligado que eu quero ver o tráfego.' : 'As outras casas: ano que vem tem mais. Igual atualização do Windows.'}`],
    ['narrador', minha ? `O teto do refeitório se pinta com as cores de ${CASA_INFO[campea].nome}. Você grita tão alto que o Bitu foge para dentro de um rack.` : 'Você aplaude, mas já está fazendo a planilha de como ganhar no ano que vem. A Tati aprova.'],
  ], g);
  if (g !== geracao) return;
  const p2 = abrirPainel();
  const anoN = s.pos.ano + 1;
  const aulasAno = ANOS[s.pos.ano].capitulos.flatMap((c) => c.passos.filter((x): x is PassoAula => x.tipo === 'aula'));
  const estrelas = aulasAno.reduce((t, a) => t + (s.aulas[a.id] ?? 0), 0);
  p2.append(h('div', { class: 'resultado' }, h('h2', {}, `Boletim do ${anoN}º ano`),
    h('div', { class: 'estrelas grandes' }, `★ ${estrelas} de ${aulasAno.length * 3}`),
    h('p', {}, personaliza(`Nível ${nivel(s.xp)}: ${titulo(s.xp)}`)),
    h('p', { class: 'dica' }, anoN < 7 ? 'Férias com a Vó Cida. Ela vai pedir para você formatar o celular dela. De novo.' : 'Sete anos. Você entrou sem saber o que era um terminal e sai com cara de quem lê log no café da manhã.')));
  aplicar({ xp: 100 });
  await clique(p2, anoN < 7 ? 'Ir para as férias' : 'Formatura');
  fecharPainel();
}

// ---------------------------------------------------------------- execução

async function executar(p: Passo, cap: Capitulo, idx: number, g: number) {
  switch (p.tipo) {
    case 'cena':
      await lugar(p.lugar);
      return falar(p.falas, g);
    case 'escolha':
      return escolha(p, g);
    case 'aula':
      return aula(p, g);
    case 'desafio':
      return desafio(p, g);
    case 'duelo':
      return duelo(p, cap, idx, g);
    case 'recompensa':
      return recompensa(p);
    case 'selecao':
      return selecao(g);
    case 'fimDeAno':
      return fimDeAno(g);
    case 'capturebol':
      await lugar(p.lugar);
      if (g !== geracao) return;
      return partida(document.getElementById('app')!, p);
  }
}

export async function jogarCapitulo(app: HTMLElement): Promise<void> {
  const g = ++geracao;
  const s = estado();
  const ano = ANOS[s.pos.ano];
  const cap = ano?.capitulos[s.pos.cap];
  if (!cap) return voltar();
  montar(app, cap, ano.numero);
  if (s.pos.passo === 0) {
    const primeiro = cap.passos.find((x) => 'lugar' in x) as { lugar?: string } | undefined;
    if (primeiro?.lugar) await lugar(primeiro.lugar);
    const painel = abrirPainel();
    painel.classList.add('escolha');
    painel.append(h('div', { class: 'resultado abertura-cap' }, h('div', { class: 'materia' }, `Ano ${ano.numero} · ${cap.mes} · capítulo ${s.pos.cap + 1}`), h('h2', {}, personaliza(cap.titulo))));
    await clique(painel, 'Começar');
    painel.classList.remove('escolha');
    fecharPainel();
  }
  while (s.pos.passo < cap.passos.length) {
    if (g !== geracao) return;
    const passo = cap.passos[s.pos.passo];
    const l = 'lugar' in passo ? passo.lugar : undefined;
    if (l) await lugar(l);
    await executar(passo, cap, s.pos.passo, g);
    if (g !== geracao) return;
    s.pos.passo++;
    salvar();
  }
  // capítulo concluído
  pontuarRivais(cap.id);
  const ganhos = aplicar({ xp: 50 });
  s.pos.cap++;
  s.pos.passo = 0;
  if (s.pos.cap >= ano.capitulos.length) {
    s.pos.ano++;
    s.pos.cap = 0;
    s.pontosCasa = zeraPontos();
    if (s.pos.ano >= ANOS.length) s.formatura = true;
  }
  salvar();
  const painel = abrirPainel();
  painel.append(h('div', { class: 'resultado' }, h('h2', {}, 'Capítulo concluído'), h('p', {}, personaliza(cap.titulo)), ...ganhos.map((t) => h('div', { class: 'ganho' }, t))));
  await clique(painel, 'Voltar ao castelo');
  cancelarHistoria();
  voltar();
}

/** revisão de aula a partir do boletim */
export async function revisarAula(app: HTMLElement, p: PassoAula, anoNum: number) {
  const g = ++geracao;
  montar(app, { id: 'revisao', titulo: `Revisão: ${p.titulo}`, mes: 'Revisão', passos: [] }, anoNum);
  await aula(p, g, true);
  if (g !== geracao) return;
  cancelarHistoria();
  voltar();
}

export { esc };
