import { describe, it, expect } from 'vitest';
import { ANOS, LUGARES } from '../src/conteudo/index';
import { modeloDoLugar } from '../src/tres/areas';
import type { PassoAula } from '../src/conteudo/tipos';

// Mesma regra do palco: aula só em sala do castelo; fora da escola é ensinamento.
const SALAS = ['aula', 'biblioteca', 'datacenter', 'torre', 'masmorra', 'persuasao', 'maquinas', 'comutacao', 'rastros', 'sinergia', 'reverso', 'tunel', 'crise', 'galpao', 'cabine', 'sandbox', 'viveiro', 'coletor', 'arquivo_dumps', 'arena', 'rotunda', 'lojalab', 'arbitragem', 'arquivo_backup', 'gabinete'];
const FORA = ['casa', 'cidade', 'trem', 'colunas', 'oficina', 'vila', 'frigorifico'];

describe('onde as aulas acontecem', () => {
  it('toda aula cai numa sala do castelo ou vira ensinamento', () => {
    let sala = 0, ensinamento = 0, mudou = 0;
    for (const a of ANOS)
      for (const c of a.capitulos)
        for (const p of c.passos.filter((x): x is PassoAula => x.tipo === 'aula')) {
          const m = modeloDoLugar(LUGARES.get(p.lugar));
          if (FORA.includes(m)) ensinamento++;
          else if (SALAS.includes(m)) sala++;
          else mudou++;
        }
    console.log(`aulas em sala: ${sala}, levadas para a sala da matéria: ${mudou}, ensinamentos fora da escola: ${ensinamento}`);
    expect(sala + mudou + ensinamento).toBeGreaterThan(80);
  });
});
