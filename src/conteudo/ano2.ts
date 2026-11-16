import type { Ano } from './tipos';
import { feiticos2, criaturas2, figurinhas2, itens2, lugares2, personagens2 } from './ano2/colecoes';
import { cap01 } from './ano2/cap01';
import { cap02 } from './ano2/cap02';
import { cap03 } from './ano2/cap03';
import { cap04 } from './ano2/cap04';
import { cap05 } from './ano2/cap05';
import { cap06 } from './ano2/cap06';
import { cap07 } from './ano2/cap07';
import { cap08 } from './ano2/cap08';
import { cap09 } from './ano2/cap09';
import { cap10 } from './ano2/cap10';

export const ano2: Ano = {
  numero: 2,
  titulo: 'A Rede Embaixo do Castelo',
  resumo: 'Redes do zero: IP, máscara, portas, DNS, Wi-Fi e as sete camadas. Embaixo do castelo, a Rede Antiga de 1890 acordou, e uma Lacraia de Cobre pula de sala em sala derrubando tudo. Alguém religou um switch esquecido nos túneis, e a culpa caiu em quem você menos esperava defender.',
  capitulos: [cap01, cap02, cap03, cap04, cap05, cap06, cap07, cap08, cap09, cap10],
  feiticos: feiticos2,
  criaturas: criaturas2,
  figurinhas: figurinhas2,
  itens: itens2,
  lugares: lugares2,
  personagens: personagens2,
};
