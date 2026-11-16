// Brasões das casas em SVG (heráldica, não personagem).
import { CASA_INFO } from '../motor/texto';

/** brasão de casa em SVG */
export function brasao(casa: keyof typeof CASA_INFO, tam = 64): string {
  const c = CASA_INFO[casa];
  const bichos: Record<string, string> = {
    oncarina: `<circle cx="50" cy="52" r="20" fill="${c.cor2}"/><circle cx="36" cy="34" r="7" fill="${c.cor2}"/><circle cx="64" cy="34" r="7" fill="${c.cor2}"/><circle cx="43" cy="50" r="3" fill="${c.cor}"/><circle cx="57" cy="50" r="3" fill="${c.cor}"/><circle cx="40" cy="62" r="2" fill="${c.cor}"/><circle cx="60" cy="62" r="2" fill="${c.cor}"/>`,
    tucanal: `<circle cx="42" cy="50" r="16" fill="${c.cor2}"/><path d="M52,42 Q86,40 80,58 Q66,56 52,56Z" fill="${c.cor}" stroke="${c.cor2}" stroke-width="2"/><circle cx="40" cy="46" r="4" fill="#fff"/>`,
    capivarias: `<rect x="24" y="40" width="52" height="30" rx="15" fill="${c.cor2}"/><circle cx="68" cy="44" r="12" fill="${c.cor2}"/><circle cx="70" cy="40" r="2.5" fill="#fff"/><rect x="34" y="20" width="14" height="14" rx="3" fill="${c.cor}" opacity=".9"/>`,
    jararacas: `<path d="M24,66 Q34,40 50,56 Q66,72 76,38" stroke="${c.cor2}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="76" cy="36" r="7" fill="${c.cor2}"/><path d="M82,34 L90,30 M82,36 L90,40" stroke="#c33" stroke-width="2"/>`,
  };
  return `<svg viewBox="0 0 100 100" width="${tam}" height="${tam}" xmlns="http://www.w3.org/2000/svg" aria-label="Brasão de ${c.nome}"><path d="M14,10 L86,10 L86,52 Q86,82 50,94 Q14,82 14,52Z" fill="${c.cor}" stroke="${c.cor2}" stroke-width="5"/>${bichos[casa]}</svg>`;
}
