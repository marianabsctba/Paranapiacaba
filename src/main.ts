import './estilo.css';
import { iniciar } from './ui/telas';
import { iniciar3d } from './tres/motor3d';
import { iniciarControles } from './tres/jogador';
import { preCarregarCenario, preCarregarElenco } from './tres/cena3d';
import * as Som from './motor/som';

try {
  const f = localStorage.getItem('paranapiacaba.fonte');
  if (f) document.documentElement.style.fontSize = f;
} catch {
  /* nada */
}

// o som liga no primeiro toque; todo botão faz um clique
Som.ligarNoPrimeiroGesto();
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest?.('button')) Som.clique();
}, true);

const mundo = document.getElementById('mundo')!;
const canvas = iniciar3d(mundo);
iniciarControles(canvas, mundo);
// os personagens só começam a baixar depois que a tela inicial e o castelo apareceram
setTimeout(preCarregarCenario, 2500);
setTimeout(preCarregarElenco, 7000);
iniciar(document.getElementById('app')!);

if (import.meta.env.DEV || import.meta.env.VITE_TESTE) {
  // gancho de teste (no modo dev, ou num build de teste com VITE_TESTE=1)
  Promise.all([import('./tres/cena3d'), import('./tres/jogador'), import('./motor/estado'), import('./tres/motor3d'), import('./tres/humanos'), import('./tres/foto'), import('./motor/som')]).then(([C3, jg, es, m3, hu, fo, som]) => {
    (window as unknown as Record<string, unknown>).__pnp = { C3, J: jg.J, es, M: m3.M, hu, fo, som };
  });
}
