import type { Ano } from './tipos';
import { feiticosAno1, criaturasAno1, figurinhasAno1, itensAno1, lugaresAno1, personagensAno1 } from './ano1/colecoes';
import { cap01 } from './ano1/cap01';
import { cap02 } from './ano1/cap02';
import { cap03 } from './ano1/cap03';
import { cap04 } from './ano1/cap04';
import { cap05 } from './ano1/cap05';
import { cap06 } from './ano1/cap06';
import { cap07 } from './ano1/cap07';
import { cap08 } from './ano1/cap08';
import { cap09 } from './ano1/cap09';
import { cap10 } from './ano1/cap10';

export const ano1: Ano = {
  numero: 1,
  titulo: 'O Convite Cifrado',
  resumo:
    'Um QR code no verso da conta de luz leva você da casa da Vó Cida até o castelo de Paranapiacaba. Senhas estão sendo roubadas, e-mails falsos da "Diretoria" pipocam por toda parte e alguém quer abrir o Cofre de Senhas da Diretora.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticosAno1,
  criaturas: criaturasAno1,
  figurinhas: figurinhasAno1,
  itens: itensAno1,
  lugares: lugaresAno1,
  personagens: personagensAno1,
};
