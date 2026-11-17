// Regras de progressão: XP, nível, títulos, efeitos, pontos das casas.
import type { CasaId, Efeito } from '../conteudo/tipos';
import { ANOS, CRIATURAS, FEITICOS, FIGURINHAS, ITENS, LUGARES, PERSONAGENS } from '../conteudo/index';
import { CASAS, estado, salvar } from './estado';
import { CASA_INFO } from './texto';

export const nivel = (xp: number) => Math.floor(Math.sqrt(xp / 25)) + 1;
export const xpDoNivel = (n: number) => 25 * (n - 1) * (n - 1);

const TITULOS: [number, string][] = [
  [1, 'Desconectad{o/a/e}'],
  [3, 'Aprendiz de Prompt'],
  [5, 'Usuári{o/a/e} sem Sudo'],
  [8, 'Operad{or/ora/ore} de Terminal'],
  [11, 'Farejad{or/ora/ore} de Pacote'],
  [14, 'Analista Júnior (com crachá)'],
  [17, 'Analista Pleno (sem hora extra)'],
  [20, 'Analista Sênior (tem opinião sobre tudo)'],
  [24, 'Especialista de Plantão'],
  [28, 'Root'],
];
export function titulo(xp: number): string {
  const n = nivel(xp);
  let t = TITULOS[0][1];
  for (const [min, nome] of TITULOS) if (n >= min) t = nome;
  return t;
}

export const NIVEIS_AMIZADE = ['Desconhecid{o/a/e}', 'Colega', 'Parceria', 'Amizade', 'Melhor amizade'];
export const nivelAmizade = (v: number) => (v >= 40 ? 4 : v >= 22 ? 3 : v >= 10 ? 2 : v >= 3 ? 1 : 0);

/** aplica um efeito e devolve linhas legíveis do que mudou */
export function aplicar(e: Efeito | undefined): string[] {
  if (!e) return [];
  const s = estado();
  const out: string[] = [];
  if (e.xp) {
    s.xp += e.xp;
    out.push(`+${e.xp} XP`);
  }
  if (e.pontosCasa && s.casa) {
    s.pontosCasa[s.casa] += e.pontosCasa;
    out.push(`${e.pontosCasa > 0 ? '+' : ''}${e.pontosCasa} pontos para ${CASA_INFO[s.casa].nome}`);
  }
  for (const [a, v] of Object.entries(e.atributos ?? {})) {
    s.atributos[a as keyof typeof s.atributos] += v ?? 0;
    out.push(`+${v} em ${a}`);
  }
  for (const [p, v] of Object.entries(e.amizade ?? {})) {
    s.amizade[p] = (s.amizade[p] ?? 0) + v;
    const nome = PERSONAGENS.get(p)?.nome ?? p;
    out.push(`${v > 0 ? '♥ +' : '♡ '}${v} amizade com ${nome}`);
  }
  const lista = (k: 'flags' | 'feiticos' | 'criaturas' | 'figurinhas' | 'itens' | 'lugares', id: string | undefined, txt?: string) => {
    if (!id || s[k].includes(id)) return;
    s[k].push(id);
    if (txt) out.push(txt);
  };
  lista('flags', e.flag);
  if (e.feitico) lista('feiticos', e.feitico, `Feitiço novo no grimório: ${FEITICOS.get(e.feitico)?.nome ?? e.feitico}`);
  if (e.criatura) lista('criaturas', e.criatura, `Criatura no bestiário: ${CRIATURAS.get(e.criatura)?.nome ?? e.criatura}`);
  if (e.figurinha) lista('figurinhas', e.figurinha, `Figurinha nova: ${FIGURINHAS.get(e.figurinha)?.nome ?? e.figurinha}`);
  if (e.item) lista('itens', e.item, `No malão: ${ITENS.get(e.item)?.nome ?? e.item}`);
  if (e.lugar) lista('lugares', e.lugar, `Lugar novo no mapa: ${LUGARES.get(e.lugar)?.nome ?? e.lugar}`);
  salvar();
  return out;
}

// pontos das outras casas: crescem a cada capítulo, de forma determinística por capítulo
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function pontuarRivais(capId: string): void {
  const s = estado();
  for (const c of CASAS) {
    if (c === s.casa) continue;
    s.pontosCasa[c] += 25 + (hash(capId + c) % 45);
  }
  salvar();
}

export function ranking(): [CasaId, number][] {
  const s = estado();
  return CASAS.map((c) => [c, s.pontosCasa[c]] as [CasaId, number]).sort((a, b) => b[1] - a[1]);
}

export const anoAtual = () => ANOS[estado().pos.ano];

export function lugaresVisiveis() {
  const s = estado();
  const n = s.pos.ano + 1;
  return [...LUGARES.values()].filter((l) => !l.dentro && (l.ano <= n || s.lugares.includes(l.id)));
}

export function totalAulasFeitas(): number {
  return Object.keys(estado().aulas).length;
}
