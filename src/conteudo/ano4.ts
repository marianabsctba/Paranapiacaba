import type { Ano } from './tipos';
import { cap01 } from './ano4/cap01';
import { cap02 } from './ano4/cap02';
import { cap03 } from './ano4/cap03';
import { cap04 } from './ano4/cap04';
import { cap05 } from './ano4/cap05';
import { cap06 } from './ano4/cap06';
import { cap07 } from './ano4/cap07';
import { cap08 } from './ano4/cap08';
import { cap09 } from './ano4/cap09';
import { cap10 } from './ano4/cap10';
import {
  personagensAno4,
  lugaresAno4,
  feiticosAno4,
  criaturasAno4,
  figurinhasAno4,
  itensAno4,
} from './ano4/colecoes';

export const ano4: Ano = {
  numero: 4,
  titulo: 'O Torneio das Bandeiras',
  resumo:
    'Paranapiacaba recebe o Colégio Pampa Digital e a Academia do Sertão para um CTF de web, e você cai no mesmo time que o Enzo. Com termo de autorização assinado, você ataca uma loja de laboratório, defende a sua ao vivo e aprende HTTP, cookies, injeção SQL, XSS, CSRF e IDOR, sempre com a correção junto. Até que alguém de fora começa a mexer no placar, e o que ele quer de verdade são as senhas das três escolas.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticosAno4,
  criaturas: criaturasAno4,
  figurinhas: figurinhasAno4,
  itens: itensAno4,
  lugares: lugaresAno4,
  personagens: personagensAno4,
};
