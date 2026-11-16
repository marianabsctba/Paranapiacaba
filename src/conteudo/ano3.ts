import type { Ano } from './tipos';
import { feiticos3, criaturas3, figurinhas3, itens3, lugares3, personagens3 } from './ano3/colecoes';
import { cap01 } from './ano3/cap01';
import { cap02 } from './ano3/cap02';
import { cap03 } from './ano3/cap03';
import { cap04 } from './ano3/cap04';
import { cap05 } from './ano3/cap05';
import { cap06 } from './ano3/cap06';
import { cap07 } from './ano3/cap07';
import { cap08 } from './ano3/cap08';
import { cap09 } from './ano3/cap09';
import { cap10 } from './ano3/cap10';

export const ano3: Ano = {
  numero: 3,
  titulo: 'Os Registros Perdidos',
  resumo: 'Um ransomware tranca as gavetas da biblioteca e o Secretário Válter culpa o Baltazar. Com grep, pipes, eventos do Windows e uma linha do tempo em UTC, a turma precisa provar por onde o bicho entrou e restaurar tudo do backup.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticos3,
  criaturas: criaturas3,
  figurinhas: figurinhas3,
  itens: itens3,
  lugares: lugares3,
  personagens: personagens3,
};
