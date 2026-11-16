import type { Ano } from './tipos';
import { feiticos6, criaturas6, figurinhas6, itens6, lugares6, personagens6 } from './ano6/colecoes';
import { cap01 } from './ano6/cap01';
import { cap02 } from './ano6/cap02';
import { cap03 } from './ano6/cap03';
import { cap04 } from './ano6/cap04';
import { cap05 } from './ano6/cap05';
import { cap06 } from './ano6/cap06';
import { cap07 } from './ano6/cap07';
import { cap08 } from './ano6/cap08';
import { cap09 } from './ano6/cap09';
import { cap10 } from './ano6/cap10';

export const ano6: Ano = {
  numero: 6,
  titulo: 'O Código da Mãe',
  resumo:
    'As amostras apreendidas do Nulo chegam ao Viveiro, e a turma aprende a abrir malware por dentro: hash, strings, PE, YARA, sandbox, memória e inteligência de ameaças. Dentro do código do inimigo aparece a assinatura da sua mãe, o Prof. Heitor enfim conta o que sabe, e a Marlene invade o castelo.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticos6,
  criaturas: criaturas6,
  figurinhas: figurinhas6,
  itens: itens6,
  lugares: lugares6,
  personagens: personagens6,
};
