// Retratos em SVG gerados no código. Estilo cartum de jogo de celular: cabeção, olhos grandes.
import type { Personagem } from '../conteudo/tipos';
import { PERSONAGENS } from '../conteudo/index';
import { estado, temPartida, type Aparencia } from '../motor/estado';
import { CASA_INFO } from '../motor/texto';

function cabeloAtras(estilo: string, cor: string): string {
  if (estilo === 'longo') return `<path d="M44,92 Q40,40 100,34 Q160,40 156,92 L162,200 Q100,214 38,200Z" fill="${cor}"/>`;
  if (estilo === 'cacheado')
    return [[56, 70], [144, 70], [46, 104], [154, 104], [52, 136], [148, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${cor}"/>`).join('');
  return '';
}

function cabeloFrente(estilo: string, cor: string): string {
  switch (estilo) {
    case 'curto':
    case 'barba':
      return `<path d="M50,96 Q46,40 100,36 Q154,40 150,96 Q140,64 112,62 Q100,74 84,64 Q60,66 50,96Z" fill="${cor}"/>`;
    case 'longo':
      return `<path d="M50,100 Q46,40 100,36 Q154,40 150,100 Q146,70 124,62 Q98,80 60,72 Q52,84 50,100Z" fill="${cor}"/>`;
    case 'coque':
      return `<circle cx="100" cy="30" r="20" fill="${cor}"/><path d="M50,96 Q48,42 100,40 Q152,42 150,96 Q136,62 100,60 Q64,62 50,96Z" fill="${cor}"/>`;
    case 'cacheado':
      return [[64, 52], [84, 40], [104, 36], [124, 40], [140, 54], [52, 74], [150, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${cor}"/>`).join('');
    case 'careca':
      return `<path d="M52,100 Q50,84 56,80 L58,104Z M148,100 Q150,84 144,80 L142,104Z" fill="${cor}" opacity=".8"/>`;
    default:
      return '';
  }
}

function rosto(pele: string, oculos: boolean, barba: string | null, bravo = false): string {
  const olhos = `<ellipse cx="80" cy="104" rx="8" ry="10" fill="#1c1324"/><ellipse cx="120" cy="104" rx="8" ry="10" fill="#1c1324"/>
<circle cx="83" cy="100" r="3" fill="#fff"/><circle cx="123" cy="100" r="3" fill="#fff"/>`;
  const sobr = bravo
    ? `<path d="M68,86 L92,92 M132,86 L108,92" stroke="#1c1324" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M68,88 Q80,82 92,88 M108,88 Q120,82 132,88" stroke="#1c1324" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const boca = bravo ? `<path d="M88,136 Q100,130 112,136" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>` : `<path d="M86,132 Q100,144 114,132" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const bochecha = `<ellipse cx="70" cy="124" rx="9" ry="5" fill="#ff7b9c" opacity=".35"/><ellipse cx="130" cy="124" rx="9" ry="5" fill="#ff7b9c" opacity=".35"/>`;
  const ocl = oculos ? `<g fill="none" stroke="#2a2a2a" stroke-width="3.5"><circle cx="80" cy="104" r="16"/><circle cx="120" cy="104" r="16"/><path d="M96,104 L104,104"/></g>` : '';
  const bb = barba ? `<path d="M56,112 Q58,162 100,166 Q142,162 144,112 Q136,146 100,148 Q64,146 56,112Z" fill="${barba}"/>` : '';
  return `<ellipse cx="100" cy="104" rx="50" ry="58" fill="${pele}"/>${bochecha}${olhos}${sobr}${bb}${boca}${ocl}`;
}

function corpo(roupa: string, detalhe = ''): string {
  return `<path d="M22,240 Q24,180 100,170 Q176,180 178,240Z" fill="${roupa}"/><rect x="88" y="150" width="24" height="26" rx="8" fill="var(--pele)"/>${detalhe}`;
}

function especial(id: string, p: Personagem): string | null {
  if (id === 'bitu')
    return `<path d="M40,240 Q40,150 100,150 Q160,150 160,240Z" fill="#1d1d1d"/><path d="M52,74 L64,24 L92,56Z M148,74 L136,24 L108,56Z" fill="#1d1d1d"/>
<ellipse cx="100" cy="100" rx="56" ry="50" fill="#1d1d1d"/><ellipse cx="80" cy="96" rx="11" ry="13" fill="#e8d44d"/><ellipse cx="120" cy="96" rx="11" ry="13" fill="#e8d44d"/>
<ellipse cx="80" cy="96" rx="3" ry="11" fill="#111"/><ellipse cx="120" cy="96" rx="3" ry="11" fill="#111"/><path d="M94,118 L106,118 L100,124Z" fill="#ff8fb1"/>
<path d="M60,120 L30,114 M60,126 L30,130 M140,120 L170,114 M140,126 L170,130" stroke="#888" stroke-width="2"/>`;
  if (id === 'chapeu')
    return `<path d="M30,150 Q30,60 100,52 Q170,60 170,150Z" fill="#f4d35e"/><rect x="16" y="146" width="168" height="20" rx="10" fill="#e0b92e"/>
<rect x="92" y="44" width="16" height="104" rx="6" fill="#e0b92e"/><circle cx="72" cy="112" r="10" fill="#1c1324"/><circle cx="128" cy="112" r="10" fill="#1c1324"/>
<circle cx="75" cy="108" r="3" fill="#7df9ff"/><circle cx="131" cy="108" r="3" fill="#7df9ff"/><rect x="60" y="180" width="80" height="34" rx="6" fill="#222"/>
<text x="100" y="203" font-family="monospace" font-size="14" fill="#7df9ff" text-anchor="middle">ML 1997</text>`;
  if (id === 'nulo')
    return `<path d="M18,240 Q20,150 100,140 Q180,150 182,240Z" fill="#0b090a"/><path d="M34,150 Q30,30 100,22 Q170,30 166,150 Q140,180 100,180 Q60,180 34,150Z" fill="#141016"/>
<ellipse cx="100" cy="110" rx="40" ry="50" fill="#0b090a"/><ellipse cx="84" cy="106" rx="8" ry="4" fill="#ff2a3d"/><ellipse cx="116" cy="106" rx="8" ry="4" fill="#ff2a3d"/>
<text x="100" y="150" font-family="monospace" font-size="16" fill="#ff2a3d" text-anchor="middle" opacity=".8">NULL</text>`;
  if (p.estilo === 'bicho')
    return `<ellipse cx="100" cy="150" rx="74" ry="78" fill="${p.roupa}"/><circle cx="76" cy="126" r="14" fill="#fff"/><circle cx="124" cy="126" r="14" fill="#fff"/>
<circle cx="78" cy="128" r="7" fill="#111"/><circle cx="126" cy="128" r="7" fill="#111"/><path d="M82,168 Q100,180 118,168" stroke="#111" stroke-width="4" fill="none"/>`;
  if (p.estilo === 'capuz')
    return `<path d="M18,240 Q20,150 100,140 Q180,150 182,240Z" fill="${p.roupa}"/><path d="M34,150 Q30,30 100,22 Q170,30 166,150Z" fill="${p.roupa}"/>${rosto(p.pele, !!p.oculos, null)}`;
  return null;
}

function svg(miolo: string, pele: string, extra = ''): string {
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style="--pele:${pele}" ${extra}>${miolo}</svg>`;
}

/** retrato da pessoa que joga: veste a capa com as cores da casa e ganha uma faixa por ano */
export function retratoVoce(anoIdx?: number, aparencia?: Aparencia): string {
  if (!aparencia && !temPartida()) return '';
  const s = aparencia ? null : estado();
  const a = aparencia ?? s!.aparencia;
  const ano = Math.min((anoIdx ?? s?.pos.ano ?? 0) + 1, 7);
  const casa = s?.casa ? CASA_INFO[s.casa] : null;
  const c1 = casa?.cor ?? '#777';
  const c2 = casa?.cor2 ?? '#333';
  const faixas = Array.from({ length: Math.min(ano, 7) }, (_, i) => `<rect x="${92}" y="${186 + i * 7}" width="16" height="4" fill="${c1}"/>`).join('');
  const capa = `<path d="M22,240 Q24,180 100,170 Q176,180 178,240Z" fill="#1b1530"/><path d="M70,174 L100,240 L130,174 Q100,168 70,174Z" fill="#f2efe6"/>
<path d="M92,180 L108,180 L112,240 L88,240Z" fill="${c2}"/>${faixas}
<circle cx="146" cy="206" r="13" fill="${c1}" stroke="${c2}" stroke-width="3"/><text x="146" y="211" font-size="13" font-weight="700" text-anchor="middle" fill="${c2}">${casa ? casa.nome[0] : '?'}</text>
<rect x="88" y="150" width="24" height="26" rx="8" fill="${a.pele}"/>`;
  const estiloCabelo = a.estilo;
  const miolo = cabeloAtras(estiloCabelo, a.cabelo) + capa + rosto(a.pele, a.oculos, null) + cabeloFrente(estiloCabelo, a.cabelo);
  return svg(miolo, a.pele);
}

export function retrato(id: string): string {
  if (id === 'narrador') return '';
  if (id === 'voce') return retratoVoce();
  const p = PERSONAGENS.get(id);
  if (!p) return '';
  const esp = especial(id, p);
  if (esp) return svg(esp, p.pele);
  const bravo = id === 'marlene' || id === 'heitor';
  const barba = p.estilo === 'barba' ? p.cabelo : null;
  const miolo = cabeloAtras(p.estilo, p.cabelo) + corpo(p.roupa) + rosto(p.pele, !!p.oculos, barba, bravo) + cabeloFrente(p.estilo, p.cabelo);
  return svg(miolo, p.pele);
}

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
