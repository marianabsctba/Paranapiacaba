// Brasões das quatro casas em SVG: escudo dividido nas duas cores da casa, borda dourada,
// padrão de fundo próprio, o bicho da casa no centro e uma fita com o nome.
import { CASA_INFO } from '../motor/texto';

type Casa = keyof typeof CASA_INFO;

const OURO = '#d9a520';
const OURO_ESC = '#8a6410';

// padrão de fundo de cada casa (pintado por cima das duas metades, bem discreto)
const PADRAO: Record<Casa, string> = {
  // rosetas de onça
  oncarina: Array.from({ length: 14 }, (_, i) => {
    const x = 34 + (i % 4) * 44 + (Math.floor(i / 4) % 2) * 22;
    const y = 40 + Math.floor(i / 4) * 44;
    return `<g opacity=".22" fill="none" stroke="#000" stroke-width="3"><circle cx="${x}" cy="${y}" r="8"/><circle cx="${x}" cy="${y}" r="2" fill="#000"/></g>`;
  }).join(''),
  // penas
  tucanal: Array.from({ length: 10 }, (_, i) => {
    const x = 30 + (i % 5) * 36;
    const y = 50 + Math.floor(i / 5) * 90;
    return `<path d="M${x},${y} q10,-20 0,-40 q-10,20 0,40Z" fill="#000" opacity=".16"/><path d="M${x},${y} l0,-40" stroke="#fff" stroke-width="1" opacity=".18"/>`;
  }).join(''),
  // ondas do rio
  capivarias: Array.from({ length: 6 }, (_, i) => `<path d="M10,${46 + i * 30} q15,-10 30,0 t30,0 t30,0 t30,0 t30,0 t30,0" fill="none" stroke="#fff" stroke-width="3" opacity=".18"/>`).join(''),
  // escamas
  jararacas: Array.from({ length: 30 }, (_, i) => {
    const x = 20 + (i % 6) * 32 + (Math.floor(i / 6) % 2) * 16;
    const y = 36 + Math.floor(i / 6) * 34;
    return `<path d="M${x - 12},${y} q12,16 24,0" fill="none" stroke="#000" stroke-width="3" opacity=".18"/>`;
  }).join(''),
};

// o bicho de cada casa, desenhado em torno de (100, 112)
function bicho(casa: Casa): string {
  const c = CASA_INFO[casa];
  switch (casa) {
    case 'oncarina':
      // cabeça de onça-pintada de frente
      return `<g>
        <circle cx="66" cy="78" r="15" fill="#e8a317" stroke="#3a1c04" stroke-width="3"/><circle cx="66" cy="78" r="7" fill="#3a1c04"/>
        <circle cx="134" cy="78" r="15" fill="#e8a317" stroke="#3a1c04" stroke-width="3"/><circle cx="134" cy="78" r="7" fill="#3a1c04"/>
        <path d="M100,62 C142,62 156,96 152,124 C148,152 126,168 100,170 C74,168 52,152 48,124 C44,96 58,62 100,62Z" fill="#f0b22c" stroke="#3a1c04" stroke-width="4"/>
        <g fill="none" stroke="#3a1c04" stroke-width="3"><circle cx="74" cy="104" r="6"/><circle cx="126" cy="104" r="6"/><circle cx="100" cy="82" r="6"/><circle cx="66" cy="130" r="5"/><circle cx="134" cy="130" r="5"/><circle cx="84" cy="74" r="4"/><circle cx="116" cy="74" r="4"/></g>
        <ellipse cx="100" cy="140" rx="24" ry="18" fill="#fbe7c0"/>
        <path d="M89,113 l-8,6 l8,4Z M111,113 l8,6 l-8,4Z" fill="#1b5e20"/>
        <path d="M86,112 q-8,0 -12,6 q8,4 16,0Z M114,112 q8,0 12,6 q-8,4 -16,0Z" fill="#ffd54f" stroke="#3a1c04" stroke-width="2"/>
        <circle cx="84" cy="116" r="2.6" fill="#111"/><circle cx="116" cy="116" r="2.6" fill="#111"/>
        <path d="M92,130 h16 l-8,9Z" fill="#5d2b10"/>
        <path d="M100,139 v6 M100,145 q-8,7 -14,2 M100,145 q8,7 14,2" fill="none" stroke="#3a1c04" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M76,140 l-20,-4 M76,145 l-20,3 M124,140 l20,-4 M124,145 l20,3" stroke="#3a1c04" stroke-width="1.5"/>
      </g>`;
    case 'tucanal':
      // tucano de perfil num galho
      return `<g>
        <path d="M46,160 q60,-14 112,4" fill="none" stroke="#5d3a1a" stroke-width="7" stroke-linecap="round"/>
        <path d="M78,72 C104,66 118,86 116,112 C114,138 100,160 84,164 C70,166 62,150 62,128 C62,100 64,76 78,72Z" fill="#141414" stroke="#000" stroke-width="2"/>
        <path d="M100,80 C112,86 116,100 112,114 C104,112 96,104 94,92Z" fill="#fff6d8"/>
        <path d="M104,84 C122,70 160,72 170,92 C160,98 132,104 108,100Z" fill="#ff8f1f" stroke="#7a3a00" stroke-width="2"/>
        <path d="M108,100 C130,104 158,98 170,92 C160,104 130,112 110,108Z" fill="#ffc531" stroke="#7a3a00" stroke-width="2"/>
        <path d="M160,86 C166,88 170,92 170,92 C166,98 160,100 158,98Z" fill="#111"/>
        <circle cx="96" cy="88" r="8" fill="#3d8bfd"/><circle cx="96" cy="88" r="3.5" fill="#111"/><circle cx="97" cy="87" r="1.2" fill="#fff"/>
        <path d="M70,150 q-6,18 -16,26 M80,156 q-2,16 -10,24" stroke="#141414" stroke-width="6" stroke-linecap="round"/>
        <path d="M84,162 v8 M92,160 v8" stroke="#3d8bfd" stroke-width="3"/>
        <path d="M90,148 q8,4 14,0" stroke="#c62828" stroke-width="5" fill="none"/>
      </g>`;
    case 'capivarias':
      // capivara de perfil, sentada na beira do rio
      return `<g>
        <path d="M34,164 q22,-8 44,0 t44,0 t44,0" fill="none" stroke="#bfe9e2" stroke-width="4"/>
        <path d="M44,150 C40,120 60,102 96,100 C120,98 132,110 134,124 C136,142 124,156 100,158 L56,158 C48,158 44,156 44,150Z" fill="#8d6748" stroke="#3e2a18" stroke-width="3"/>
        <path d="M120,104 C130,84 152,80 164,92 C174,102 172,120 160,126 C150,130 134,128 126,122Z" fill="#9b7452" stroke="#3e2a18" stroke-width="3"/>
        <ellipse cx="138" cy="86" rx="6" ry="8" fill="#6d4c33" stroke="#3e2a18" stroke-width="2"/>
        <circle cx="150" cy="100" r="3" fill="#111"/>
        <ellipse cx="168" cy="112" rx="3" ry="2" fill="#2b1a10"/>
        <path d="M150,122 q8,2 14,-2" fill="none" stroke="#3e2a18" stroke-width="2"/>
        <path d="M60,158 v12 M80,158 v12 M108,156 v14 M124,152 v16" stroke="#3e2a18" stroke-width="6" stroke-linecap="round"/>
        <path d="M70,118 q16,-6 32,0 M64,132 q20,-6 40,0" fill="none" stroke="#6d4c33" stroke-width="2" opacity=".7"/>
        <circle cx="146" cy="74" r="7" fill="#ffd54f" stroke="#a37b00" stroke-width="2"/>
        <path d="M146,67 l3,-7 M139,70 l-6,-4 M153,70 l6,-4" stroke="#a37b00" stroke-width="2"/>
      </g>`;
    case 'jararacas':
      // jararaca em S com o desenho de triângulos no dorso
      return `<g>
        <path d="M58,170 C40,150 60,132 92,136 C128,140 150,124 140,104 C130,84 96,96 80,84 C66,74 74,58 96,56" fill="none" stroke="#5a4a2c" stroke-width="22" stroke-linecap="round"/>
        <path d="M58,170 C40,150 60,132 92,136 C128,140 150,124 140,104 C130,84 96,96 80,84 C66,74 74,58 96,56" fill="none" stroke="#a8925a" stroke-width="16" stroke-linecap="round"/>
        <g fill="#3b2f1a">${[[64, 154], [84, 138], [108, 138], [130, 128], [142, 110], [128, 94], [104, 92], [82, 84], [78, 66]].map(([x, y]) => `<path d="M${x - 6},${y + 5} l6,-10 l6,10Z"/>`).join('')}</g>
        <path d="M92,48 C104,44 120,48 122,56 C120,64 104,68 92,64 C86,60 86,52 92,48Z" fill="#a8925a" stroke="#3b2f1a" stroke-width="3"/>
        <circle cx="110" cy="54" r="2.6" fill="#111"/>
        <path d="M122,57 h10 l5,-4 M132,57 l5,4" fill="none" stroke="#c62828" stroke-width="2.2" stroke-linecap="round"/>
      </g>`;
  }
  return `<circle cx="100" cy="112" r="40" fill="${c.cor}"/>`;
}

/** brasão completo: escudo, bicho e fita com o nome */
export function brasaoSvg(casa: Casa, comFita = true): string {
  const c = CASA_INFO[casa];
  const escudo = 'M20,18 H180 V112 C180,168 140,200 100,222 C60,200 20,168 20,112Z';
  const fita = comFita
    ? `<path d="M2,206 L28,196 L32,226 L8,234 L16,220Z M198,206 L172,196 L168,226 L192,234 L184,220Z" fill="${OURO_ESC}"/>
       <path d="M26,196 Q100,178 174,196 L170,226 Q100,208 30,226Z" fill="${OURO}" stroke="${OURO_ESC}" stroke-width="3"/>
       <text x="100" y="216" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="19" fill="#2a1a00" letter-spacing="1">${c.nome.toUpperCase()}</text>`
    : '';
  return `<svg viewBox="0 0 200 ${comFita ? 240 : 230}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brasão de ${c.nome}">
    <defs>
      <clipPath id="esc-${casa}"><path d="${escudo}"/></clipPath>
      <linearGradient id="brilho-${casa}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <g clip-path="url(#esc-${casa})">
      <rect x="0" y="0" width="100" height="240" fill="${c.cor}"/>
      <rect x="100" y="0" width="100" height="240" fill="${c.cor2}"/>
      ${PADRAO[casa]}
      <rect x="0" y="0" width="200" height="240" fill="url(#brilho-${casa})"/>
    </g>
    <path d="${escudo}" fill="none" stroke="${OURO}" stroke-width="9"/>
    <path d="${escudo}" fill="none" stroke="${OURO_ESC}" stroke-width="2" transform="translate(0,0)"/>
    <path d="M28,26 H172 V112 C172,162 136,192 100,212 C64,192 28,162 28,112Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
    ${bicho(casa)}
    ${fita}
  </svg>`;
}

/** brasão pequeno para a interface (mantém a assinatura antiga: casa e tamanho em px) */
export function brasao(casa: Casa, tam = 64): string {
  return brasaoSvg(casa, tam >= 48).replace('<svg ', `<svg width="${tam}" height="${Math.round(tam * 1.2)}" `);
}
