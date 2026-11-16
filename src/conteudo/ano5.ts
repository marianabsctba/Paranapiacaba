import type { Ano } from './tipos';
import { cap01 } from './ano5/cap01';
import { cap02 } from './ano5/cap02';
import { cap03 } from './ano5/cap03';
import { cap04 } from './ano5/cap04';
import { cap05 } from './ano5/cap05';
import { cap06 } from './ano5/cap06';
import { cap07 } from './ano5/cap07';
import { cap08 } from './ano5/cap08';
import { cap09 } from './ano5/cap09';
import { cap10 } from './ano5/cap10';
import {
  personagensAno5,
  lugaresAno5,
  feiticosAno5,
  criaturasAno5,
  figurinhasAno5,
  itensAno5,
} from './ano5/colecoes';

export const ano5: Ano = {
  numero: 5,
  titulo: 'Plantão',
  resumo:
    'A Secretaria terceiriza a segurança do castelo para uma consultoria de slide bonito e afasta a Profa. Nanda por "excesso de alertas". Você e a turma montam um SOC clandestino no galpão dos trens, com plantão de madrugada, regra Sigma e muito café. Este é o ano do Blue Team.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticosAno5,
  criaturas: criaturasAno5,
  figurinhas: figurinhasAno5,
  itens: itensAno5,
  lugares: lugaresAno5,
  personagens: personagensAno5,
};
