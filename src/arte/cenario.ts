// Cenários de fundo em SVG, um por tipo de lugar. Neblina da serra em tudo, claro.
import type { Lugar } from '../conteudo/tipos';

const ceu = (a: string, b: string) =>
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/>`;
const estrelas = Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 137) % 400}" cy="${(i * 53) % 140}" r="${i % 3 === 0 ? 1.6 : 0.9}" fill="#fff" opacity=".7"/>`).join('');
const neblina = `<g class="neblina"><ellipse cx="80" cy="250" rx="160" ry="30" fill="#fff" opacity=".10"/><ellipse cx="320" cy="262" rx="170" ry="34" fill="#fff" opacity=".12"/><ellipse cx="200" cy="285" rx="260" ry="30" fill="#fff" opacity=".10"/></g>`;
const janelas = (xs: number[], y: number) => xs.map((x) => `<rect x="${x}" y="${y}" width="8" height="14" rx="4" fill="#ffd77a" opacity=".85"/>`).join('');

const CENAS: Record<Lugar['cena'], string> = {
  castelo:
    ceu('#1a1440', '#4a3b7a') + estrelas + `<circle cx="330" cy="60" r="26" fill="#f6f1d3" opacity=".9"/>` +
    `<path d="M0,240 Q100,190 200,215 T400,205 L400,300 L0,300Z" fill="#20193a"/>` +
    `<g fill="#120e26"><rect x="110" y="120" width="180" height="120"/><rect x="90" y="80" width="40" height="160"/><path d="M84,80 L110,40 L136,80Z"/><rect x="270" y="70" width="44" height="170"/><path d="M264,70 L292,24 L320,70Z"/><rect x="180" y="90" width="40" height="150"/><path d="M174,90 L200,50 L226,90Z"/><rect x="198" y="30" width="3" height="22"/><path d="M201,30 L216,36 L201,42Z" fill="#ff7b9c"/></g>` +
    janelas([100, 114, 196, 280, 296, 140, 240], 110) + janelas([150, 230, 280], 170) + neblina,
  sala:
    ceu('#2b2140', '#1b1530') +
    `<g fill="#3b2f5a"><path d="M40,40 L40,220 L100,220 L100,70 Q70,30 40,70Z"/><path d="M300,40 L300,220 L360,220 L360,70 Q330,30 300,70Z"/></g>` +
    `<path d="M50,70 Q70,44 90,70 L90,200 L50,200Z M310,70 Q330,44 350,70 L350,200 L310,200Z" fill="#6b8cff" opacity=".35"/>` +
    `<rect x="0" y="220" width="400" height="80" fill="#2a1d14"/><rect x="130" y="80" width="140" height="80" rx="4" fill="#0e2b1a" stroke="#6b4a2a" stroke-width="6"/>` +
    `<text x="200" y="125" font-family="monospace" font-size="14" fill="#7dff9b" text-anchor="middle">$ whoami</text>` + neblina,
  masmorra:
    ceu('#16131c', '#2a2430') +
    Array.from({ length: 36 }, (_, i) => `<rect x="${(i % 9) * 46 - ((Math.floor(i / 9) % 2) * 23)}" y="${Math.floor(i / 9) * 30 + 40}" width="44" height="28" fill="#2f2938" stroke="#1c1822"/>`).join('') +
    `<rect x="0" y="230" width="400" height="70" fill="#1a1620"/><circle cx="60" cy="110" r="10" fill="#ffb347" opacity=".8"/><circle cx="340" cy="110" r="10" fill="#ffb347" opacity=".8"/>` +
    `<rect x="160" y="140" width="80" height="90" rx="6" fill="#4a4a55" stroke="#222" stroke-width="4"/><circle cx="200" cy="185" r="14" fill="none" stroke="#c9b26b" stroke-width="4"/>`,
  floresta:
    ceu('#0f2a24', '#204a3a') +
    Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50 - 10},250 L${i * 50 + 25},${80 + (i % 3) * 30} L${i * 50 + 60},250Z" fill="#0b1f19"/>`).join('') +
    `<rect x="0" y="240" width="400" height="60" fill="#0a1a15"/><circle cx="120" cy="200" r="3" fill="#b5ff7a"/><circle cx="270" cy="180" r="3" fill="#b5ff7a"/><circle cx="330" cy="215" r="3" fill="#b5ff7a"/>` + neblina,
  cidade:
    ceu('#3a2b55', '#c76d6d') +
    `<g fill="#2a1d36"><rect x="10" y="150" width="70" height="120"/><path d="M5,150 L45,110 L85,150Z"/><rect x="100" y="170" width="60" height="100"/><path d="M95,170 L130,135 L165,170Z"/><rect x="180" y="120" width="80" height="150"/><rect x="280" y="160" width="60" height="110"/><path d="M275,160 L310,125 L345,160Z"/><rect x="350" y="140" width="50" height="130"/></g>` +
    janelas([30, 52, 118, 196, 220, 240, 296, 366], 180) + `<rect x="0" y="260" width="400" height="40" fill="#1a1222"/>` + neblina,
  casa:
    ceu('#e8c9a0', '#c99c6e') +
    `<rect x="40" y="50" width="120" height="100" fill="#8ec5ff" stroke="#fff" stroke-width="8"/><path d="M100,50 L100,150 M40,100 L160,100" stroke="#fff" stroke-width="6"/>` +
    `<rect x="0" y="220" width="400" height="80" fill="#9b6b43"/><rect x="230" y="150" width="130" height="70" rx="8" fill="#7a3b5a"/><rect x="250" y="120" width="40" height="30" fill="#222"/>` +
    `<rect x="300" y="100" width="34" height="20" rx="3" fill="#333" transform="rotate(180 317 110)"/><circle cx="306" cy="106" r="2" fill="#4f4"/><text x="317" y="96" font-size="9" text-anchor="middle" fill="#333">roteador</text>`,
  trem:
    ceu('#4b5a7a', '#a8b4c8') +
    `<path d="M0,200 L120,90 L240,200Z M180,200 L300,110 L400,200Z" fill="#6c7a93"/>` +
    `<rect x="40" y="170" width="300" height="60" rx="10" fill="#7a1f2b"/><rect x="300" y="150" width="70" height="80" rx="8" fill="#5a1520"/>` +
    janelas([60, 100, 140, 180, 220, 260], 182) + `<circle cx="90" cy="236" r="14" fill="#222"/><circle cx="290" cy="236" r="14" fill="#222"/><rect x="0" y="246" width="400" height="8" fill="#444"/>` + neblina,
  campo:
    ceu('#5ab0ff', '#cbe8ff') +
    `<rect x="0" y="210" width="400" height="90" fill="#3f9a4a"/><g fill="none" stroke="#f2d16b" stroke-width="5"><circle cx="60" cy="90" r="20"/><circle cx="340" cy="80" r="20"/><circle cx="340" cy="140" r="16"/></g>` +
    `<path d="M60,110 L60,210 M340,100 L340,210" stroke="#d9b54f" stroke-width="4"/>` +
    `<g fill="#7a5530"><rect x="120" y="170" width="160" height="40"/><rect x="130" y="150" width="140" height="20"/></g><circle cx="210" cy="60" r="6" fill="#ffd700"><animate attributeName="cx" values="180;240;200;180" dur="3s" repeatCount="indefinite"/></circle>` + neblina,
  torre:
    ceu('#0d0b26', '#2b1f5c') + estrelas +
    `<rect x="160" y="60" width="80" height="240" fill="#1a1538"/><path d="M200,10 L200,60 M180,30 L220,30 M186,44 L214,44" stroke="#9aa4c8" stroke-width="4"/>` +
    `<circle cx="200" cy="10" r="5" fill="#ff4d6d"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>` + janelas([180, 212], 120) + janelas([196], 180) + neblina,
  lago:
    ceu('#1c2a4a', '#3a5a7a') + `<circle cx="80" cy="70" r="22" fill="#f6f1d3" opacity=".8"/>` +
    `<path d="M0,150 Q100,120 200,140 T400,130 L400,170 L0,170Z" fill="#1a2338"/><rect x="0" y="165" width="400" height="135" fill="#11213a"/>` +
    Array.from({ length: 8 }, (_, i) => `<path d="M${i * 55},${200 + (i % 3) * 25} q15,-6 30,0" stroke="#5a8ac0" stroke-width="2" fill="none" opacity=".6"/>`).join('') + neblina,
  banco:
    ceu('#2a2a2a', '#4a4a4a') +
    `<path d="M60,90 L200,40 L340,90Z" fill="#d8d0b8"/><rect x="60" y="90" width="280" height="12" fill="#c8c0a8"/>` +
    [80, 130, 180, 230, 280].map((x) => `<rect x="${x}" y="102" width="20" height="120" fill="#e8e0c8"/>`).join('') + `<rect x="50" y="222" width="300" height="20" fill="#c8c0a8"/><rect x="0" y="242" width="400" height="60" fill="#333"/>`,
  ministerio:
    ceu('#87b5e5', '#e8f2ff') +
    `<rect x="0" y="210" width="400" height="90" fill="#9fb58a"/><rect x="40" y="180" width="320" height="30" fill="#e8e8e8"/>` +
    `<path d="M110,180 Q140,140 170,180Z" fill="#f4f4f4" stroke="#bbb"/><path d="M230,140 Q260,190 290,140Z" fill="#f4f4f4" stroke="#bbb"/>` +
    `<rect x="186" y="60" width="12" height="120" fill="#f0f0f0"/><rect x="202" y="60" width="12" height="120" fill="#f0f0f0"/>` +
    `<rect x="330" y="150" width="20" height="30" rx="4" fill="#ff9e2c"/><text x="340" y="146" font-size="8" text-anchor="middle" fill="#333">orelhão</text>`,
};

export function cenario(tipo: Lugar['cena'] | undefined): string {
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${CENAS[tipo ?? 'castelo'] ?? CENAS.castelo}</svg>`;
}
