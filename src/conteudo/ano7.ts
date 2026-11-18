import type { Ano } from './tipos';
import { cap01 } from './ano7/cap01';
import { cap02 } from './ano7/cap02';
import { cap03 } from './ano7/cap03';
import { cap04 } from './ano7/cap04';
import { cap05 } from './ano7/cap05';
import { cap06 } from './ano7/cap06';
import { cap07 } from './ano7/cap07';
import { cap08 } from './ano7/cap08';
import { cap09 } from './ano7/cap09';
import { cap10 } from './ano7/cap10';
import {
  personagensAno7,
  lugaresAno7,
  feiticosAno7,
  criaturasAno7,
  figurinhasAno7,
  itensAno7,
} from './ano7/colecoes';

export const ano7: Ano = {
  numero: 7,
  titulo: 'O Grande Apagão',
  resumo:
    'O Nulo derruba de uma vez as redes de todas as escolas bruxas, e o castelo vira um centro de resposta a incidente. Com Active Directory, Kerberos, caça às persistências, contenção em escala e um backup guardado a duas chaves, a turma reencontra a mãe no Vale do Ribeira, resgata o pai de um frigorífico e prova, com evidência, quem é o Nulo. No fim, formatura, cordel e a última camada da pasta NAO_ABRA.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticosAno7,
  criaturas: criaturasAno7,
  figurinhas: figurinhasAno7,
  itens: itensAno7,
  lugares: lugaresAno7,
  personagens: personagensAno7,
};
