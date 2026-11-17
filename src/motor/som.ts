// Som do jogo, todo sintetizado no navegador (Web Audio): música por clima, ambiente do lugar e efeitos.
// Nada é baixado: as notas são geradas na hora. O contexto só liga depois do primeiro toque (regra dos navegadores).

export type Clima = 'castelo' | 'banquete' | 'vila' | 'misterio' | 'tensao' | 'natureza' | 'aconchego' | 'viagem' | 'duelo' | 'festa' | 'silencio';
export type Ambiente = 'nenhum' | 'vento' | 'burburinho' | 'servidor' | 'gotas' | 'passaros' | 'trem';

const CHAVE = 'paranapiacaba.som';
interface Prefs { musica: number; efeitos: number; mudo: boolean }
let prefs: Prefs = { musica: 0.55, efeitos: 0.7, mudo: false };
try {
  const p = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
  if (p) prefs = { ...prefs, ...p };
} catch {
  /* nada */
}

let ctx: AudioContext | null = null;
let mestre: GainNode;
let busMusica: GainNode;
let busEfeitos: GainNode;
let busAmbiente: GainNode;
let reverb: ConvolverNode;
let medidor: AnalyserNode | null = null;
let saidaFinal: AudioNode | null = null;
let ruido: AudioBuffer;
let climaAtual: Clima = 'silencio';
let climaPedido: Clima = 'silencio';
let ambientePedido: Ambiente = 'nenhum';
let musica: { parar: () => void } | null = null;
let ambiente: { parar: () => void } | null = null;

export function preferencias(): Prefs {
  return { ...prefs };
}

export function ajustar(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(prefs));
  } catch {
    /* nada */
  }
  if (!ctx) return;
  const t = ctx.currentTime;
  mestre.gain.setTargetAtTime(prefs.mudo ? 0 : 1, t, 0.05);
  busMusica.gain.setTargetAtTime(prefs.musica * 1.5, t, 0.1);
  busEfeitos.gain.setTargetAtTime(prefs.efeitos * 2, t, 0.05);
  busAmbiente.gain.setTargetAtTime(prefs.efeitos * 1.1, t, 0.1);
}

/** liga o áudio no primeiro gesto da pessoa (clique, toque ou tecla) */
export function ligarNoPrimeiroGesto() {
  const liga = () => {
    iniciar();
    ctx?.resume();
    if (ctx?.state === 'running') ['pointerdown', 'keydown', 'touchstart'].forEach((e) => removeEventListener(e, liga, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => addEventListener(e, liga, true));
}

function iniciar() {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  mestre = ctx.createGain();
  const limitador = ctx.createDynamicsCompressor();
  limitador.threshold.value = -10;
  limitador.ratio.value = 6;
  mestre.connect(limitador).connect(ctx.destination);
  saidaFinal = limitador;
  medidor = ctx.createAnalyser();
  medidor.fftSize = 2048;
  limitador.connect(medidor);
  busMusica = ctx.createGain();
  busEfeitos = ctx.createGain();
  busAmbiente = ctx.createGain();
  busMusica.connect(mestre);
  busEfeitos.connect(mestre);
  busAmbiente.connect(mestre);
  // reverb de salão de pedra: ruído que decai
  reverb = ctx.createConvolver();
  const n = ctx.sampleRate * 2.6;
  const ir = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
  }
  reverb.buffer = ir;
  const volta = ctx.createGain();
  volta.gain.value = 0.35;
  reverb.connect(volta).connect(mestre);
  ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const r = ruido.getChannelData(0);
  for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;
  ajustar({});
  trocarClima(climaPedido, true);
  trocarAmbiente(ambientePedido);
}

// ---------------------------------------------------------------- instrumentos

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function envelope(g: GainNode, t: number, a: number, pico: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pico, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

/** harpa/celesta: triângulo com decaimento rápido e um brilho de oitava */
function harpa(destino: AudioNode, midi: number, t: number, vol = 0.18, dur = 1.6) {
  const c = ctx!;
  for (const [mult, v] of [[1, 1], [2, 0.25]] as const) {
    const o = c.createOscillator();
    o.type = mult === 1 ? 'triangle' : 'sine';
    o.frequency.value = freq(midi) * mult;
    const g = c.createGain();
    envelope(g, t, 0.005, vol * v, dur);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + dur + 0.1);
  }
}

/** sino: parciais inarmônicas, som de relógio de torre */
function sino(destino: AudioNode, midi: number, t: number, vol = 0.1) {
  const c = ctx!;
  for (const [mult, v, d] of [[1, 1, 3], [2.76, 0.4, 1.6], [5.4, 0.2, 0.9]] as const) {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq(midi) * mult;
    const g = c.createGain();
    envelope(g, t, 0.003, vol * v, d);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + d + 0.1);
  }
}

/** pad: dente de serra desafinado passando por filtro, entra e sai devagar */
function pad(destino: AudioNode, midis: number[], t: number, dur: number, vol = 0.05, brilho = 900) {
  const c = ctx!;
  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = brilho;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  filtro.connect(g).connect(destino);
  for (const m of midis)
    for (const det of [-7, 7]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(m);
      o.detune.value = det;
      o.connect(filtro);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
}

/** baixo redondo */
function baixo(destino: AudioNode, midi: number, t: number, dur: number, vol = 0.12) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq(midi);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(destino);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** flauta: seno com vibrato e sopro */
function flauta(destino: AudioNode, midi: number, t: number, dur: number, vol = 0.07) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq(midi);
  const lfo = c.createOscillator();
  lfo.frequency.value = 5.2;
  const prof = c.createGain();
  prof.gain.value = freq(midi) * 0.006;
  lfo.connect(prof).connect(o.frequency);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.08);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(destino);
  o.start(t);
  lfo.start(t);
  o.stop(t + dur + 0.05);
  lfo.stop(t + dur + 0.05);
}

/** percussão: ruído curto filtrado (bumbo grave ou chocalho agudo) */
function batida(destino: AudioNode, t: number, grave: boolean, vol = 0.2) {
  const c = ctx!;
  if (grave) {
    const o = c.createOscillator();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    const g = c.createGain();
    envelope(g, t, 0.002, vol, 0.25);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + 0.3);
    return;
  }
  const s = c.createBufferSource();
  s.buffer = ruido;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 6000;
  const g = c.createGain();
  envelope(g, t, 0.001, vol * 0.35, 0.06);
  s.connect(f).connect(g).connect(destino);
  s.start(t, Math.random());
  s.stop(t + 0.1);
}

// ---------------------------------------------------------------- música generativa por clima

interface Receita {
  bpm: number;
  acordes: number[][]; // notas MIDI de cada acorde (um por compasso)
  arpejo?: 'harpa' | 'sino' | 'flauta';
  padrao?: number[]; // índices do acorde por colcheia (-1 = pausa)
  melodia?: boolean;
  pad?: number; // volume do pad
  brilhoPad?: number;
  percussao?: 'valsa' | 'marcha' | 'coracao' | 'trem';
  baixoVol?: number;
}

const RECEITAS: Record<Exclude<Clima, 'silencio'>, Receita> = {
  // ré dórico, mistério gentil de castelo antigo
  castelo: { bpm: 72, acordes: [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]], arpejo: 'harpa', padrao: [0, 1, 2, 3, 2, 1, 2, 3], melodia: true, pad: 0.035 },
  banquete: { bpm: 108, acordes: [[48, 55, 60, 64], [53, 60, 65, 69], [55, 62, 67, 71], [48, 55, 60, 64]], arpejo: 'harpa', padrao: [0, 2, 3, -1, 2, 3], melodia: true, pad: 0.03, percussao: 'valsa' },
  vila: { bpm: 92, acordes: [[55, 62, 67, 71], [52, 59, 64, 67], [48, 55, 60, 64], [50, 57, 62, 66]], arpejo: 'harpa', padrao: [0, 2, 1, 3, 2, 1, 3, 2], melodia: true, pad: 0.025, baixoVol: 0.1 },
  misterio: { bpm: 56, acordes: [[45, 52, 57, 60], [44, 51, 56, 59], [41, 48, 53, 57], [40, 47, 52, 56]], arpejo: 'sino', padrao: [3, -1, -1, -1, 2, -1, -1, -1], pad: 0.05, brilhoPad: 600 },
  tensao: { bpm: 96, acordes: [[45, 52, 57, 60], [45, 52, 57, 60], [46, 53, 58, 61], [44, 51, 56, 59]], arpejo: 'harpa', padrao: [0, 0, 3, 0, 0, 2, 0, 1], pad: 0.04, brilhoPad: 700, percussao: 'coracao' },
  natureza: { bpm: 66, acordes: [[50, 57, 62, 66], [55, 62, 67, 71], [52, 59, 64, 67], [57, 64, 69, 73]], arpejo: 'flauta', padrao: [3, -1, 2, -1, 1, -1, -1, -1], pad: 0.03 },
  aconchego: { bpm: 64, acordes: [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]], arpejo: 'sino', padrao: [0, 2, 3, 2, 1, 2, 3, 2], pad: 0.025 },
  viagem: { bpm: 100, acordes: [[52, 59, 64, 68], [49, 56, 61, 64], [45, 52, 57, 61], [47, 54, 59, 63]], arpejo: 'harpa', padrao: [0, 1, 2, 3, 2, 1, 0, 1], melodia: true, pad: 0.025, percussao: 'trem' },
  duelo: { bpm: 132, acordes: [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 56]], arpejo: 'harpa', padrao: [0, 2, 1, 3, 0, 2, 1, 3], pad: 0.035, percussao: 'marcha', baixoVol: 0.14 },
  festa: { bpm: 120, acordes: [[48, 55, 60, 64], [55, 62, 67, 71], [57, 64, 69, 72], [53, 60, 65, 69]], arpejo: 'harpa', padrao: [0, 1, 2, 3, 2, 3, 1, 2], melodia: true, pad: 0.03, percussao: 'marcha' },
};

function tocarReceita(rc: Receita): { parar: () => void } {
  const c = ctx!;
  const saida = c.createGain();
  saida.gain.value = 0;
  saida.gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
  saida.connect(busMusica);
  const envio = c.createGain();
  envio.gain.value = 0.5;
  saida.connect(envio).connect(reverb);
  const colcheia = 60 / rc.bpm / 2;
  const porCompasso = rc.padrao?.length ?? 8;
  let proximo = c.currentTime + 0.1;
  let passo = 0;
  let notaMel = 0;
  let parou = false;
  const agenda = () => {
    if (parou) return;
    while (proximo < c.currentTime + 0.6) {
      const compasso = Math.floor(passo / porCompasso);
      const k = passo % porCompasso;
      const acorde = rc.acordes[compasso % rc.acordes.length];
      if (k === 0) {
        if (rc.pad) pad(saida, acorde.map((n) => n + 12), proximo, colcheia * porCompasso + 0.4, rc.pad, rc.brilhoPad ?? 900);
        baixo(saida, acorde[0] - 12, proximo, colcheia * porCompasso * 0.9, rc.baixoVol ?? 0.09);
      }
      const idx = rc.padrao?.[k] ?? -1;
      if (idx >= 0 && rc.arpejo) {
        const n = acorde[idx] + 12;
        if (rc.arpejo === 'harpa') harpa(saida, n, proximo, 0.11);
        else if (rc.arpejo === 'sino') sino(saida, n + 12, proximo, 0.06);
        else flauta(saida, n + 12, proximo, colcheia * 1.8, 0.05);
      }
      // melodia: passeio pela escala do acorde, com frases que respiram
      if (rc.melodia && k % 2 === 0 && (compasso % 4 !== 3 || k < 4) && Math.random() < 0.55) {
        notaMel = Math.max(0, Math.min(7, notaMel + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
        const escala = [...acorde, ...acorde.map((n) => n + 12)].sort((a, b) => a - b);
        flauta(saida, escala[notaMel] + 12, proximo, colcheia * 1.9, 0.045);
      }
      if (rc.percussao === 'valsa' && k % 3 === 0) batida(saida, proximo, k === 0, 0.12);
      if (rc.percussao === 'marcha') {
        if (k % 4 === 0) batida(saida, proximo, true, 0.18);
        if (k % 2 === 1) batida(saida, proximo, false, 0.12);
      }
      if (rc.percussao === 'coracao' && (k === 0 || k === 1)) batida(saida, proximo + (k ? 0.05 : 0), true, k ? 0.08 : 0.13);
      if (rc.percussao === 'trem' && k % 2 === 0) batida(saida, proximo, false, 0.16);
      proximo += colcheia;
      passo++;
    }
  };
  const id = setInterval(agenda, 120);
  agenda();
  return {
    parar: () => {
      parou = true;
      clearInterval(id);
      const t = c.currentTime;
      saida.gain.cancelScheduledValues(t);
      saida.gain.setValueAtTime(saida.gain.value, t);
      saida.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => saida.disconnect(), 2600);
    },
  };
}

export function trocarClima(c: Clima, forcar = false) {
  climaPedido = c;
  if (!ctx || (c === climaAtual && !forcar)) return;
  climaAtual = c;
  musica?.parar();
  musica = c === 'silencio' ? null : tocarReceita(RECEITAS[c]);
}

// ---------------------------------------------------------------- ambiente do lugar

function lacoDeRuido(destino: AudioNode, tipo: BiquadFilterType, f: number, q: number, vol: number) {
  const c = ctx!;
  const s = c.createBufferSource();
  s.buffer = ruido;
  s.loop = true;
  const filtro = c.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = f;
  filtro.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(filtro).connect(g).connect(destino);
  s.start();
  return { s, filtro, g };
}

export function trocarAmbiente(a: Ambiente) {
  ambientePedido = a;
  if (!ctx) return;
  ambiente?.parar();
  ambiente = null;
  if (a === 'nenhum') return;
  const c = ctx;
  const saida = c.createGain();
  saida.gain.value = 0;
  saida.gain.linearRampToValueAtTime(1, c.currentTime + 2);
  saida.connect(busAmbiente);
  const timers: number[] = [];
  const parar: (() => void)[] = [];
  if (a === 'vento') {
    const v = lacoDeRuido(saida, 'bandpass', 500, 0.6, 0.12);
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.09;
    const p = c.createGain();
    p.gain.value = 260;
    lfo.connect(p).connect(v.filtro.frequency);
    lfo.start();
    parar.push(() => lfo.stop());
  } else if (a === 'burburinho') {
    // várias vozes abafadas: ruído na faixa da fala com volume oscilando
    for (const f of [320, 520, 780]) {
      const v = lacoDeRuido(saida, 'bandpass', f, 3, 0.05);
      const lfo = c.createOscillator();
      lfo.frequency.value = 2 + Math.random() * 3;
      const p = c.createGain();
      p.gain.value = 0.035;
      lfo.connect(p).connect(v.g.gain);
      lfo.start();
      parar.push(() => lfo.stop());
    }
  } else if (a === 'servidor') {
    lacoDeRuido(saida, 'lowpass', 900, 0.7, 0.07);
    const zumbido = c.createOscillator();
    zumbido.frequency.value = 120;
    const g = c.createGain();
    g.gain.value = 0.012;
    zumbido.connect(g).connect(saida);
    zumbido.start();
    parar.push(() => zumbido.stop());
  } else if (a === 'gotas') {
    lacoDeRuido(saida, 'lowpass', 300, 0.5, 0.05);
    const pinga = () => {
      const t = c.currentTime;
      const o = c.createOscillator();
      o.frequency.setValueAtTime(1400 + Math.random() * 900, t);
      o.frequency.exponentialRampToValueAtTime(500, t + 0.08);
      const g = c.createGain();
      envelope(g, t, 0.002, 0.05, 0.12);
      o.connect(g).connect(saida);
      g.connect(reverb);
      o.start(t);
      o.stop(t + 0.2);
      timers.push(window.setTimeout(pinga, 900 + Math.random() * 2600));
    };
    pinga();
  } else if (a === 'passaros') {
    lacoDeRuido(saida, 'bandpass', 2400, 0.8, 0.015);
    const canta = () => {
      const t = c.currentTime;
      const base = 2200 + Math.random() * 1600;
      for (let i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
        const o = c.createOscillator();
        const ti = t + i * 0.11;
        o.frequency.setValueAtTime(base, ti);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), ti + 0.07);
        const g = c.createGain();
        envelope(g, ti, 0.005, 0.03, 0.08);
        o.connect(g).connect(saida);
        o.start(ti);
        o.stop(ti + 0.12);
      }
      timers.push(window.setTimeout(canta, 1500 + Math.random() * 4000));
    };
    canta();
  } else if (a === 'trem') {
    lacoDeRuido(saida, 'lowpass', 220, 0.7, 0.14);
    const tique = () => {
      const t = c.currentTime;
      for (const d of [0, 0.16]) {
        const s = c.createBufferSource();
        s.buffer = ruido;
        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 900;
        const g = c.createGain();
        envelope(g, t + d, 0.002, 0.12, 0.08);
        s.connect(f).connect(g).connect(saida);
        s.start(t + d, Math.random());
        s.stop(t + d + 0.12);
      }
      timers.push(window.setTimeout(tique, 1100));
    };
    tique();
  }
  ambiente = {
    parar: () => {
      timers.forEach(clearTimeout);
      const t = c.currentTime;
      saida.gain.cancelScheduledValues(t);
      saida.gain.setValueAtTime(saida.gain.value, t);
      saida.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => {
        parar.forEach((f) => f());
        saida.disconnect();
      }, 1800);
    },
  };
}

// ---------------------------------------------------------------- efeitos

function pronto() {
  return ctx && ctx.state === 'running' && !prefs.mudo;
}

export function clique() {
  if (!pronto()) return;
  const c = ctx!;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(880, t);
  o.frequency.exponentialRampToValueAtTime(1320, t + 0.04);
  const g = c.createGain();
  envelope(g, t, 0.002, 0.05, 0.06);
  o.connect(g).connect(busEfeitos);
  o.start(t);
  o.stop(t + 0.1);
}

export function acerto() {
  if (!pronto()) return;
  const t = ctx!.currentTime;
  [72, 76, 79, 84].forEach((n, i) => harpa(busEfeitos, n, t + i * 0.07, 0.12, 0.8));
}

export function erro() {
  if (!pronto()) return;
  const t = ctx!.currentTime;
  [64, 60].forEach((n, i) => {
    const o = ctx!.createOscillator();
    o.type = 'square';
    o.frequency.value = freq(n - 12);
    const f = ctx!.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    const g = ctx!.createGain();
    envelope(g, t + i * 0.16, 0.005, 0.05, 0.22);
    o.connect(f).connect(g).connect(busEfeitos);
    o.start(t + i * 0.16);
    o.stop(t + i * 0.16 + 0.3);
  });
}

/** brilho de recompensa (XP, figurinha, ponto da casa) */
export function brilho() {
  if (!pronto()) return;
  const t = ctx!.currentTime;
  [84, 88, 91].forEach((n, i) => sino(busEfeitos, n, t + i * 0.06, 0.04));
}

/** porta: sopro de ar e um baque de madeira */
export function porta() {
  if (!pronto()) return;
  const c = ctx!;
  const t = c.currentTime;
  const s = c.createBufferSource();
  s.buffer = ruido;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(400, t);
  f.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
  const g = c.createGain();
  envelope(g, t, 0.05, 0.08, 0.35);
  s.connect(f).connect(g).connect(busEfeitos);
  s.start(t, Math.random());
  s.stop(t + 0.5);
  batida(busEfeitos, t + 0.32, true, 0.12);
}

/** feitiço: ida é um zunido que sobe e brilha; volta é um impacto grave */
export function feitico(ida: boolean) {
  if (!pronto()) return;
  const c = ctx!;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(ida ? 300 : 900, t);
  o.frequency.exponentialRampToValueAtTime(ida ? 1800 : 120, t + 0.4);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = ida ? 3000 : 1200;
  const g = c.createGain();
  envelope(g, t, 0.01, 0.07, 0.45);
  o.connect(f).connect(g).connect(busEfeitos);
  g.connect(reverb);
  o.start(t);
  o.stop(t + 0.5);
  if (ida) [91, 96].forEach((n, i) => sino(busEfeitos, n, t + 0.4 + i * 0.05, 0.05));
  else batida(busEfeitos, t + 0.42, true, 0.25);
}

/** passo: chamado pelo jogador enquanto anda; madeira, pedra ou rua mudam o timbre */
let ultimoPasso = 0;
let superficie: 'madeira' | 'pedra' | 'terra' = 'madeira';
export function chao(s: typeof superficie) {
  superficie = s;
}
export function passo(correndo: boolean) {
  if (!pronto()) return;
  const c = ctx!;
  const t = c.currentTime;
  if (t - ultimoPasso < (correndo ? 0.3 : 0.45)) return;
  ultimoPasso = t;
  const s = c.createBufferSource();
  s.buffer = ruido;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = (superficie === 'pedra' ? 1400 : superficie === 'terra' ? 500 : 800) * (0.85 + Math.random() * 0.3);
  f.Q.value = 1.2;
  const g = c.createGain();
  envelope(g, t, 0.003, superficie === 'terra' ? 0.05 : 0.08, 0.09);
  s.connect(f).connect(g).connect(busEfeitos);
  s.start(t, Math.random());
  s.stop(t + 0.15);
}

/** bolhas e um "ahh" quentinho para o quentão */
export function quentao() {
  if (!pronto()) return;
  const c = ctx!;
  const t = c.currentTime;
  for (let i = 0; i < 6; i++) {
    const o = c.createOscillator();
    const ti = t + i * 0.09 + Math.random() * 0.04;
    o.frequency.setValueAtTime(300 + Math.random() * 200, ti);
    o.frequency.exponentialRampToValueAtTime(700 + Math.random() * 300, ti + 0.05);
    const g = c.createGain();
    envelope(g, ti, 0.003, 0.06, 0.07);
    o.connect(g).connect(busEfeitos);
    o.start(ti);
    o.stop(ti + 0.1);
  }
  brilho();
}

// ---------------------------------------------------------------- qual clima e ambiente cada cenário pede

export function somDoLugar(modelo: string): { clima: Clima; ambiente: Ambiente; chao: 'madeira' | 'pedra' | 'terra' } {
  const m = modelo;
  if (m === 'salao' || m === 'colunas') return { clima: 'banquete', ambiente: 'burburinho', chao: 'pedra' };
  if (m === 'patio') return { clima: 'castelo', ambiente: 'vento', chao: 'pedra' };
  if (m === 'vila' || m === 'cidade') return { clima: 'vila', ambiente: 'burburinho', chao: 'pedra' };
  if (m === 'vagao' || m.startsWith('loja_')) return { clima: 'vila', ambiente: m === 'vagao' ? 'burburinho' : 'nenhum', chao: 'madeira' };
  if (['datacenter', 'coletor'].includes(m)) return { clima: 'castelo', ambiente: 'servidor', chao: 'pedra' };
  if (['crise', 'galpao', 'sandbox'].includes(m)) return { clima: 'tensao', ambiente: 'servidor', chao: 'pedra' };
  if (m === 'masmorra' || m === 'tunel' || m.startsWith('arquivo_')) return { clima: 'misterio', ambiente: 'gotas', chao: 'pedra' };
  if (['floresta', 'lago', 'viveiro'].includes(m)) return { clima: 'natureza', ambiente: 'passaros', chao: 'terra' };
  if (['dormitorio', 'casa', 'oficina'].includes(m)) return { clima: 'aconchego', ambiente: 'nenhum', chao: 'madeira' };
  if (m === 'trem') return { clima: 'viagem', ambiente: 'trem', chao: 'madeira' };
  if (m === 'clube') return { clima: 'duelo', ambiente: 'burburinho', chao: 'madeira' };
  if (m === 'arena' || m === 'campo') return { clima: 'festa', ambiente: m === 'campo' ? 'vento' : 'burburinho', chao: m === 'campo' ? 'terra' : 'madeira' };
  if (['pombal', 'relogio', 'torre', 'cabine'].includes(m)) return { clima: 'castelo', ambiente: 'vento', chao: 'madeira' };
  return { clima: 'castelo', ambiente: 'nenhum', chao: 'madeira' };
}

/** nível do som na saída (para teste): média e pico de 0 a 1 */
export function nivel(): { rms: number; pico: number; estado: string } {
  if (!ctx || !medidor) return { rms: 0, pico: 0, estado: 'desligado' };
  const d = new Float32Array(medidor.fftSize);
  medidor.getFloatTimeDomainData(d);
  let soma = 0;
  let pico = 0;
  for (const v of d) {
    soma += v * v;
    pico = Math.max(pico, Math.abs(v));
  }
  return { rms: Math.sqrt(soma / d.length), pico, estado: ctx.state };
}

/** grava alguns segundos do que está tocando (só para teste): devolve o áudio em base64 (webm) */
export function gravar(segundos: number): Promise<string> {
  if (!ctx || !saidaFinal) return Promise.resolve('');
  const destino = ctx.createMediaStreamDestination();
  saidaFinal.connect(destino);
  const rec = new MediaRecorder(destino.stream);
  const partes: Blob[] = [];
  rec.ondataavailable = (e) => partes.push(e.data);
  return new Promise((ok) => {
    rec.onstop = async () => {
      saidaFinal?.disconnect(destino);
      const buf = await new Blob(partes).arrayBuffer();
      let bin = '';
      const b = new Uint8Array(buf);
      for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
      ok(btoa(bin));
    };
    rec.start();
    setTimeout(() => rec.stop(), segundos * 1000);
  });
}
