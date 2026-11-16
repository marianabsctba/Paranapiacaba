import { describe, it, expect } from 'vitest';
import type { Ano, Efeito, Exercicio, Passo } from '../src/conteudo/tipos';
import { PERSONAGENS_BASE, LUGARES_BASE } from '../src/conteudo/personagens';
import { ANOS } from '../src/conteudo/index';

// Para validar só um ano: ANO=3 npx vitest run
const env = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const filtro = env.ANO ? Number(env.ANO) : 0;
const anos = filtro ? ANOS.filter((a) => a.numero === filtro) : ANOS;

const normaliza = (s: string) => s.trim().replace(/\s+/g, ' ');
export const casaComando = (aceitos: string[], cmd: string) =>
  aceitos.some((r) => new RegExp(`^(?:${r})$`, 'i').test(normaliza(cmd)));

const ids = <T extends { id: string }>(f: (a: Ano) => T[], base: T[] = []) => {
  const todos = [...base, ...ANOS.flatMap(f)].map((x) => x.id);
  return { todos, set: new Set(todos) };
};

const personagens = ids((a) => a.personagens, PERSONAGENS_BASE);
const lugares = ids((a) => a.lugares, LUGARES_BASE);
const feiticos = ids((a) => a.feiticos);
const criaturas = ids((a) => a.criaturas);
const figurinhas = ids((a) => a.figurinhas);
const itens = ids((a) => a.itens);

function textos(obj: unknown, out: string[] = []): string[] {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => textos(x, out));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((x) => textos(x, out));
  return out;
}

function confereEfeito(e: Efeito | undefined, onde: string) {
  if (!e) return;
  if (e.criatura) expect(criaturas.set.has(e.criatura), `${onde}: criatura ${e.criatura}`).toBe(true);
  if (e.figurinha) expect(figurinhas.set.has(e.figurinha), `${onde}: figurinha ${e.figurinha}`).toBe(true);
  if (e.feitico) expect(feiticos.set.has(e.feitico), `${onde}: feitiço ${e.feitico}`).toBe(true);
  if (e.item) expect(itens.set.has(e.item), `${onde}: item ${e.item}`).toBe(true);
  if (e.lugar) expect(lugares.set.has(e.lugar), `${onde}: lugar ${e.lugar}`).toBe(true);
  for (const p of Object.keys(e.amizade ?? {})) expect(personagens.set.has(p), `${onde}: amizade ${p}`).toBe(true);
}

function confereExercicio(ex: Exercicio, onde: string) {
  expect(ex.explicacao.length, `${onde}: explicação vazia`).toBeGreaterThan(10);
  switch (ex.tipo) {
    case 'multipla':
      expect(ex.opcoes.length, onde).toBeGreaterThanOrEqual(2);
      expect(ex.opcoes.length, onde).toBeLessThanOrEqual(5);
      expect(ex.correta >= 0 && ex.correta < ex.opcoes.length, `${onde}: correta fora`).toBe(true);
      expect(new Set(ex.opcoes).size, `${onde}: opções repetidas`).toBe(ex.opcoes.length);
      break;
    case 'terminal':
      expect(ex.aceitos.length, onde).toBeGreaterThan(0);
      for (const r of ex.aceitos) expect(() => new RegExp(r), `${onde}: regex inválida ${r}`).not.toThrow();
      expect(casaComando(ex.aceitos, ex.exemplo), `${onde}: exemplo "${ex.exemplo}" não casa com aceitos`).toBe(true);
      expect(casaComando(ex.aceitos, 'xyzzy'), `${onde}: aceitos aceita qualquer coisa`).toBe(false);
      expect(casaComando(ex.aceitos, ''), `${onde}: aceitos aceita vazio`).toBe(false);
      break;
    case 'ligar':
      expect(ex.pares.length, onde).toBeGreaterThanOrEqual(3);
      expect(ex.pares.length, onde).toBeLessThanOrEqual(6);
      expect(new Set(ex.pares.map((p) => p[0])).size, `${onde}: esquerda repetida`).toBe(ex.pares.length);
      expect(new Set(ex.pares.map((p) => p[1])).size, `${onde}: direita repetida`).toBe(ex.pares.length);
      break;
    case 'ordenar':
      expect(ex.itens.length, onde).toBeGreaterThanOrEqual(3);
      expect(ex.itens.length, onde).toBeLessThanOrEqual(7);
      expect(new Set(ex.itens).size, `${onde}: itens repetidos`).toBe(ex.itens.length);
      break;
    case 'lacuna':
      expect(ex.enunciado.split('___').length, `${onde}: precisa de exatamente um ___`).toBe(2);
      expect(ex.aceitos.length, onde).toBeGreaterThan(0);
      break;
    case 'achar':
      expect(ex.corretas.length, onde).toBeGreaterThan(0);
      expect(ex.corretas.length, `${onde}: não pode marcar tudo`).toBeLessThan(ex.linhas.length);
      for (const i of ex.corretas) expect(i >= 0 && i < ex.linhas.length, `${onde}: índice ${i}`).toBe(true);
      break;
  }
}

function confereFalas(falas: [string, string][], onde: string) {
  for (const [quem, txt] of falas) {
    expect(personagens.set.has(quem), `${onde}: personagem desconhecido "${quem}"`).toBe(true);
    expect(txt.length, `${onde}: fala vazia`).toBeGreaterThan(0);
    expect(txt.length, `${onde}: fala longa demais (${txt.length}): ${txt.slice(0, 60)}`).toBeLessThanOrEqual(320);
  }
}

function confereLugar(id: string, onde: string) {
  expect(lugares.set.has(id), `${onde}: lugar desconhecido "${id}"`).toBe(true);
}

function conferePasso(p: Passo, onde: string) {
  switch (p.tipo) {
    case 'cena':
      confereLugar(p.lugar, onde);
      expect(p.falas.length, onde).toBeGreaterThan(0);
      confereFalas(p.falas, onde);
      break;
    case 'aula':
      confereLugar(p.lugar, onde);
      expect(personagens.set.has(p.professor), `${onde}: professor ${p.professor}`).toBe(true);
      confereFalas(p.abertura, onde);
      expect(p.explicacao.length, `${onde}: explicação curta`).toBeGreaterThanOrEqual(2);
      expect(p.exercicios.length, `${onde}: precisa de pelo menos 4 exercícios`).toBeGreaterThanOrEqual(4);
      expect(new Set(p.exercicios.map((e) => e.tipo)).size, `${onde}: varie os tipos de exercício`).toBeGreaterThanOrEqual(2);
      p.exercicios.forEach((e, i) => confereExercicio(e, `${onde} ex${i}`));
      if (p.feitico) expect(feiticos.set.has(p.feitico), `${onde}: feitiço ${p.feitico}`).toBe(true);
      break;
    case 'escolha':
      confereLugar(p.lugar, onde);
      expect(p.opcoes.length, onde).toBeGreaterThanOrEqual(2);
      for (const o of p.opcoes) {
        confereFalas(o.resposta, onde);
        confereEfeito(o.efeito, onde);
      }
      break;
    case 'desafio':
      confereLugar(p.lugar, onde);
      confereFalas(p.antes, onde);
      confereFalas(p.depois, onde);
      confereExercicio(p.exercicio, onde);
      break;
    case 'recompensa':
      confereEfeito(p.efeito, onde);
      break;
  }
}

describe('identificadores', () => {
  for (const [nome, g] of Object.entries({ personagens, lugares, feiticos, criaturas, figurinhas, itens })) {
    it(`${nome} sem repetição`, () => {
      const rep = g.todos.filter((x, i) => g.todos.indexOf(x) !== i);
      expect(rep, `${nome} repetidos`).toEqual([]);
    });
  }
  it('ids em ASCII', () => {
    for (const g of [personagens, lugares, feiticos, criaturas, figurinhas, itens])
      for (const id of g.todos) expect(/^[a-z0-9_]+$/.test(id), `id inválido: ${id}`).toBe(true);
  });
  it('capítulos e aulas sem repetição', () => {
    const caps = ANOS.flatMap((a) => a.capitulos.map((c) => c.id));
    expect(caps.filter((x, i) => caps.indexOf(x) !== i)).toEqual([]);
    const aulas = ANOS.flatMap((a) => a.capitulos.flatMap((c) => c.passos.flatMap((p) => (p.tipo === 'aula' ? [p.id] : []))));
    expect(aulas.filter((x, i) => aulas.indexOf(x) !== i)).toEqual([]);
  });
});

for (const ano of anos) {
  describe(`ano ${ano.numero}`, () => {
    it('sem travessão', () => {
      const ruins = textos(ano).filter((t) => /[–—]/.test(t));
      expect(ruins.slice(0, 5)).toEqual([]);
    });
    it('marcação de gênero bem formada', () => {
      for (const t of textos(ano)) {
        for (const m of t.match(/\{[^}]*\}/g) ?? []) {
          const ok = m === '{nome}' || m === '{casa}' || m.slice(1, -1).split('/').length === 3;
          expect(ok, `marcação estranha ${m} em: ${t.slice(0, 80)}`).toBe(true);
        }
      }
    });
    if (ano.capitulos.length === 0) return;
    it('passos válidos', () => {
      for (const c of ano.capitulos) c.passos.forEach((p, i) => conferePasso(p, `${c.id} passo ${i} (${p.tipo})`));
    });
    it('termina com fimDeAno', () => {
      const ult = ano.capitulos[ano.capitulos.length - 1].passos;
      expect(ult[ult.length - 1].tipo).toBe('fimDeAno');
    });
    it('feitiços do ano são ensinados', () => {
      const ensinados = new Set<string>();
      for (const c of ano.capitulos)
        for (const p of c.passos) {
          if (p.tipo === 'aula' && p.feitico) ensinados.add(p.feitico);
          if (p.tipo === 'recompensa' && p.efeito.feitico) ensinados.add(p.efeito.feitico);
        }
      for (const f of ano.feiticos) expect(ensinados.has(f.id), `feitiço ${f.id} nunca é ensinado`).toBe(true);
    });
    it('tamanho mínimo', () => {
      const aulas = ano.capitulos.flatMap((c) => c.passos.filter((p) => p.tipo === 'aula'));
      expect(ano.capitulos.length).toBeGreaterThanOrEqual(8);
      expect(aulas.length).toBeGreaterThanOrEqual(16);
    });
  });
}
