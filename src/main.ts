import './estilo.css';
import { iniciar } from './ui/telas';

try {
  const f = localStorage.getItem('paranapiacaba.fonte');
  if (f) document.documentElement.style.fontSize = f;
} catch {
  /* nada */
}

iniciar(document.getElementById('app')!);
