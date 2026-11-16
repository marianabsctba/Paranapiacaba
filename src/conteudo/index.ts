import type { Ano, Feitico, Criatura, Figurinha, Item, Lugar, Personagem, PassoAula } from './tipos';
import { PERSONAGENS_BASE, LUGARES_BASE } from './personagens';
import { ano1 } from './ano1';
import { ano2 } from './ano2';
import { ano3 } from './ano3';
import { ano4 } from './ano4';
import { ano5 } from './ano5';
import { ano6 } from './ano6';
import { ano7 } from './ano7';

export const ANOS: Ano[] = [ano1, ano2, ano3, ano4, ano5, ano6, ano7];

const junta = <T extends { id: string }>(base: T[], f: (a: Ano) => T[]): Map<string, T> => {
  const m = new Map<string, T>();
  for (const x of base) m.set(x.id, x);
  for (const a of ANOS) for (const x of f(a)) m.set(x.id, x);
  return m;
};

export const PERSONAGENS: Map<string, Personagem> = junta(PERSONAGENS_BASE, (a) => a.personagens);
export const LUGARES: Map<string, Lugar> = junta(LUGARES_BASE, (a) => a.lugares);
export const FEITICOS: Map<string, Feitico> = junta([], (a) => a.feiticos);
export const CRIATURAS: Map<string, Criatura> = junta([], (a) => a.criaturas);
export const FIGURINHAS: Map<string, Figurinha> = junta([], (a) => a.figurinhas);
export const ITENS: Map<string, Item> = junta([], (a) => a.itens);

export const AULAS: Map<string, { aula: PassoAula; ano: number }> = new Map();
for (const a of ANOS)
  for (const c of a.capitulos)
    for (const p of c.passos) if (p.tipo === 'aula') AULAS.set(p.id, { aula: p, ano: a.numero });
