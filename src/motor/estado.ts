// Estado salvo da partida. Fica no localStorage e pode ser exportado como código.
import type { Atributo, CasaId } from '../conteudo/tipos';

export interface Aparencia {
  pele: string;
  cabelo: string; // cor
  estilo: 'curto' | 'longo' | 'careca' | 'coque' | 'cacheado';
  oculos: boolean;
}

export interface Posicao {
  ano: number; // índice em ANOS (0 a 6)
  cap: number; // índice do capítulo no ano
  passo: number; // índice do passo no capítulo
}

export interface Estado {
  v: 1;
  nome: string;
  pronome: 0 | 1 | 2; // ele, ela, elu
  aparencia: Aparencia;
  casa?: CasaId;
  pos: Posicao;
  xp: number;
  atributos: Record<Atributo, number>;
  pontosCasa: Record<CasaId, number>; // do ano corrente
  tacas: (CasaId | null)[]; // casa campeã de cada ano já concluído
  amizade: Record<string, number>;
  flags: string[];
  feiticos: string[];
  criaturas: string[];
  figurinhas: string[];
  itens: string[];
  lugares: string[];
  segredos: string[]; // 'lugar#indice'
  aulas: Record<string, number>; // melhor nota em estrelas (0 a 3)
  duelos: Record<string, boolean>; // 'capitulo#passo' -> venceu
  enfeites: string[]; // itens colocados no dormitório
  formatura: boolean;
  criadoEm: number;
}

const CHAVE = 'paranapiacaba.v1';
let atual: Estado | null = null;

export const ATRIBUTOS: Atributo[] = ['sistemas', 'redes', 'cripto', 'web', 'defesa', 'forense', 'ofensiva', 'social'];
export const CASAS: CasaId[] = ['oncarina', 'tucanal', 'capivarias', 'jararacas'];

const zeraAtributos = () => Object.fromEntries(ATRIBUTOS.map((a) => [a, 0])) as Record<Atributo, number>;
export const zeraPontos = () => Object.fromEntries(CASAS.map((c) => [c, 0])) as Record<CasaId, number>;

export function novoEstado(nome: string, pronome: 0 | 1 | 2, aparencia: Aparencia): Estado {
  atual = {
    v: 1,
    nome,
    pronome,
    aparencia,
    pos: { ano: 0, cap: 0, passo: 0 },
    xp: 0,
    atributos: zeraAtributos(),
    pontosCasa: zeraPontos(),
    tacas: [],
    amizade: {},
    flags: [],
    feiticos: [],
    criaturas: [],
    figurinhas: [],
    itens: [],
    lugares: [],
    segredos: [],
    aulas: {},
    duelos: {},
    enfeites: [],
    formatura: false,
    criadoEm: Date.now(),
  };
  salvar();
  return atual;
}

export function estado(): Estado {
  if (!atual) throw new Error('sem partida');
  return atual;
}

export function temPartida(): boolean {
  return atual !== null;
}

export function salvar(): void {
  if (!atual) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    /* navegação privada: segue sem salvar */
  }
}

function valida(x: unknown): Estado | null {
  if (!x || typeof x !== 'object') return null;
  const e = x as Estado;
  if (e.v !== 1 || typeof e.nome !== 'string' || !e.pos) return null;
  // completa campos que versões futuras possam acrescentar
  e.atributos = { ...zeraAtributos(), ...(e.atributos ?? {}) };
  e.pontosCasa = { ...zeraPontos(), ...(e.pontosCasa ?? {}) };
  for (const k of ['flags', 'feiticos', 'criaturas', 'figurinhas', 'itens', 'lugares', 'segredos', 'enfeites', 'tacas'] as const)
    if (!Array.isArray(e[k])) (e as unknown as Record<string, unknown>)[k] = [];
  e.aulas ??= {};
  e.duelos ??= {};
  e.amizade ??= {};
  return e;
}

export function carregar(): Estado | null {
  try {
    const t = localStorage.getItem(CHAVE);
    if (!t) return null;
    atual = valida(JSON.parse(t));
    return atual;
  } catch {
    return null;
  }
}

export function apagar(): void {
  atual = null;
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada */
  }
}

export function exportar(): string {
  const json = JSON.stringify(estado());
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return 'PNP1.' + btoa(bin);
}

export function importar(codigo: string): boolean {
  try {
    const limpo = codigo.trim().replace(/^PNP1\./, '');
    const bin = atob(limpo);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const e = valida(JSON.parse(new TextDecoder().decode(bytes)));
    if (!e) return false;
    atual = e;
    salvar();
    return true;
  } catch {
    return false;
  }
}
