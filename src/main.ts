import './estilo.css';
import { iniciar } from './ui/telas';
import { iniciar3d } from './tres/motor3d';
import { iniciarControles } from './tres/jogador';
import { preCarregarElenco } from './tres/cena3d';

try {
  const f = localStorage.getItem('paranapiacaba.fonte');
  if (f) document.documentElement.style.fontSize = f;
} catch {
  /* nada */
}

const mundo = document.getElementById('mundo')!;
const canvas = iniciar3d(mundo);
iniciarControles(canvas, mundo);
preCarregarElenco();
iniciar(document.getElementById('app')!);

if (import.meta.env.DEV) {
  // gancho de teste (só no modo dev)
  Promise.all([import('./tres/cena3d'), import('./tres/jogador'), import('./motor/estado'), import('./tres/motor3d'), import('./tres/humanos'), import('./tres/foto')]).then(([C3, jg, es, m3, hu, fo]) => {
    (window as unknown as Record<string, unknown>).__pnp = { C3, J: jg.J, es, M: m3.M, hu, fo };
  });
}
