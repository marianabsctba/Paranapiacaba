// Enfeites do malão no dormitório 3D: pôsteres na parede, roupas nos ganchos, luminárias acesas e objetos nas prateleiras.
// O seu canto é a cama da frente, à esquerda de quem entra (encostada na parede x = -4,5).
import * as THREE from 'three';
import { estado } from '../motor/estado';
import { ITENS } from '../conteudo/index';
import { M } from './motor3d';

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
const PAREDE = -4.47;

type Tipo = 'poster' | 'roupa' | 'luz' | 'objeto';
interface Desenho { tipo: Tipo; fundo: string; tinta: string; linhas: string[]; cor?: number; forma?: 'caixa' | 'caneca' | 'chave' | 'papel' | 'fita' | 'cracha' | 'hd' | 'pendrive' | 'saco' | 'alicate' | 'foto' | 'doce' }

// como cada item do malão aparece no quarto
const ENFEITES: Record<string, Desenho> = {
  a1_poster: { tipo: 'poster', fundo: '#1a0e0a', tinta: '#f2c45a', linhas: ['🔥 FUNCIONA', 'NA MINHA', 'MÁQUINA 🔥'] },
  a2_poster_osi: { tipo: 'poster', fundo: '#2a1a2e', tinta: '#ffd0e0', linhas: ['7 Aplicação', '6 Apresentação', '5 Sessão', '4 Transporte', '3 Rede', '2 Enlace', '1 Física', '8 Usuário?'] },
  a5_poster_attck: { tipo: 'poster', fundo: '#0e1a2a', tinta: '#6ef2ff', linhas: ['MATRIZ ATT&CK', '▦▦▦▦▦▦▦▦', '▦▦▦▦▦▦▦▦', '▦▦▦▦▦▦▦▦', '▦▦▦▦▦▦▦▦'] },
  a6_poster_pe: { tipo: 'poster', fundo: '#0a1a10', tinta: '#7dff9a', linhas: ['MZ', 'DOS stub', 'PE header', '.text', '.data', '.rsrc'] },
  a5_slide_emoldurado: { tipo: 'poster', fundo: '#f4f1ea', tinta: '#1a1a2e', linhas: ['RISCO:', 'BAIXO', '(semana do', 'incidente)'] },
  a2_mapa_tuneis: { tipo: 'poster', fundo: '#e8dcc0', tinta: '#3a2a1a', linhas: ['TÚNEIS', '─┬─┼─┬─', ' │ ⬚ │ ', '─┴─┼─┴─', 'rato aqui'] },
  a2_mapa_mae: { tipo: 'poster', fundo: '#efe6d0', tinta: '#2a2a6a', linhas: ['◯──◯──◯', '│  ╳  │', '◯──◉──◯', 'APAGÃO'] },
  a6_camada6: { tipo: 'poster', fundo: '#101820', tinta: '#e8c66a', linhas: ['location', 'lat -23.77', 'lon -46.30', '— Lena'] },
  a1_moletom_casa: { tipo: 'roupa', fundo: 'casa', tinta: '#f2eee2', linhas: ['♛'] },
  a2_camiseta_ttl: { tipo: 'roupa', fundo: '#151515', tinta: '#f2eee2', linhas: ['MEU TTL', 'ZEROU'] },
  a3_moletom_utc: { tipo: 'roupa', fundo: '#8a8a8a', tinta: '#1a1a1a', linhas: ['UTC', '◷'] },
  a5_moletom_plantao: { tipo: 'roupa', fundo: '#6a6a72', tinta: '#ffd166', linhas: ['SOBREVIVI', 'AO PLANTÃO', 'DAS 3H'] },
  a6_jaleco: { tipo: 'roupa', fundo: '#f2f2f0', tinta: '#2a2a6a', linhas: ['sandbox', 'sempre'] },
  a2_luminaria_link: { tipo: 'luz', fundo: '', tinta: '', linhas: [], cor: 0x33ff66 },
  a3_luminaria_tail: { tipo: 'luz', fundo: '', tinta: '', linhas: [], cor: 0x6ef2ff },
  a6_luminaria_hex: { tipo: 'luz', fundo: '', tinta: '', linhas: [], cor: 0xffaa33 },
  a1_panetone: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'caixa', cor: 0xc0392b },
  a1_chave_seguranca: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'chave', cor: 0x2a2a2a },
  a1_foto_pais: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'foto', cor: 0xb8933e },
  a2_alicate: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'alicate', cor: 0xd4302a },
  a3_lacre: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'saco', cor: 0xe8f0ff },
  a3_hd_tati: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'hd', cor: 0x2a2a30 },
  a3_logs_2015: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'papel', cor: 0xf2eee2 },
  a4_fonte: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'papel', cor: 0xe8f0d8 },
  a5_cracha_plantao: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'cracha', cor: 0x2e7dd1 },
  a5_pacoca_root: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'doce', cor: 0xc89a5a },
  a5_gravacao_lena: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'fita', cor: 0x1a1a1a },
  a6_caneca_yara: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'caneca', cor: 0xf2eee2 },
  a6_pendrive_lacrado: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'pendrive', cor: 0x3a6ad1 },
  a4_termo: { tipo: 'poster', fundo: '#f4f1ea', tinta: '#1a1a2e', linhas: ['TERMO DE', 'AUTORIZAÇÃO', 'escopo · horário', '3 assinaturas'] },
  a4_cordel_caio: { tipo: 'poster', fundo: '#e8dcc0', tinta: '#2a1a10', linhas: ['A PELEJA', 'DO JONAS', 'COM O CAIO', '✦ cordel ✦'] },
  a4_cracha_torneio: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'cracha', cor: 0x7cc5db },
  a4_cuia: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'caneca', cor: 0x8a5a2a },
  a7_diploma: { tipo: 'poster', fundo: '#f4ecd8', tinta: '#2a1a4a', linhas: ['DIPLOMA', 'Paranapiacaba', 'Bruxaria', 'Cibernética'] },
  a7_cracha_crise: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'cracha', cor: 0xc0392b },
  a7_barbante: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'doce', cor: 0xc0392b },
  a7_runbook: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'papel', cor: 0xe8e0c8 },
  a7_relogio_rui: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'doce', cor: 0xb8933e },
  a7_bilhete: { tipo: 'objeto', fundo: '', tinta: '', linhas: [], forma: 'papel', cor: 0xfff6d8 },
};

// onde cada coisa pode ficar: [z, y] na parede, ou [x, y, z] em cima de móvel
const POSTERES: [number, number, number][] = [[0.5, 2.45, 1], [-0.95, 2.65, 0.8], [-0.3, 3.3, 0.7], [1.35, 3.3, 0.7], [2.65, 2.7, 0.8], [3.65, 2.7, 0.8], [1.45, 2.45, 0.7], [4.4, 2.7, 0.6]];
const GANCHOS = [2.3, 2.85, 3.4, 3.95, 4.5];
const LUGARES: [number, number, number][] = [
  [-3.15, 0.6, -1.12], [-3.45, 0.6, -0.8],
  [-4.3, 1.02, -1.3], [-4.3, 1.02, -0.95], [-4.3, 1.02, -0.6],
  [-4.3, 1.42, -1.3], [-4.3, 1.42, -0.95], [-4.3, 1.42, -0.6],
  [-4.3, 1.82, -1.3], [-4.3, 1.82, -0.95], [-4.3, 1.82, -0.6],
  [-3.25, 0.56, 1.95], [-2.85, 0.56, 1.95],
];

function texto(fundo: string, tinta: string, linhas: string[], w = 256, hh = 320, molde?: (c: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = hh;
  const c = cv.getContext('2d')!;
  if (molde) molde(c);
  else {
    c.fillStyle = fundo;
    c.fillRect(0, 0, w, hh);
  }
  c.fillStyle = tinta;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const tam = Math.min(46, Math.floor((hh * 0.8) / Math.max(1, linhas.length)));
  c.font = `bold ${tam}px sans-serif`;
  linhas.forEach((l, i) => c.fillText(l, w / 2, hh / 2 + (i - (linhas.length - 1) / 2) * tam * 1.1, w - 20));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** silhueta de roupa pendurada (moletom, camiseta, jaleco) pintada em canvas */
function roupa(cor: string, tinta: string, linhas: string[]): THREE.CanvasTexture {
  return texto(cor, tinta, linhas, 256, 256, (c) => {
    c.clearRect(0, 0, 256, 256);
    c.fillStyle = cor;
    c.beginPath();
    c.moveTo(78, 20);
    c.lineTo(178, 20);
    c.lineTo(246, 78);
    c.lineTo(214, 112);
    c.lineTo(190, 92);
    c.lineTo(190, 246);
    c.lineTo(66, 246);
    c.lineTo(66, 92);
    c.lineTo(42, 112);
    c.lineTo(10, 78);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    c.lineWidth = 4;
    c.stroke();
  });
}

function objeto(g: THREE.Group, d: Desenho, x: number, y: number, z: number, atualiza: ((t: number) => void)[]) {
  const m = std({ color: d.cor ?? 0x888888, roughness: 0.6 });
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, dx = 0, dy = 0, dz = 0) => {
    const me = new THREE.Mesh(geo, mat);
    me.position.set(x + dx, y + dy, z + dz);
    me.castShadow = true;
    g.add(me);
    return me;
  };
  switch (d.forma) {
    case 'caixa': {
      add(new THREE.BoxGeometry(0.22, 0.2, 0.22), m, 0, 0.1);
      add(new THREE.BoxGeometry(0.23, 0.03, 0.05), std({ color: 0xf2c45a }), 0, 0.2);
      break;
    }
    case 'caneca': {
      add(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 14), m, 0, 0.055);
      const asa = add(new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), m, 0.055, 0.055);
      asa.rotation.z = -Math.PI / 2;
      break;
    }
    case 'chave':
      add(new THREE.BoxGeometry(0.05, 0.01, 0.025), m, 0, 0.005);
      add(new THREE.TorusGeometry(0.012, 0.004, 6, 10), std({ color: 0xc0c0c0, metalness: 0.9 }), -0.035, 0.006);
      break;
    case 'papel':
      for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.2, 0.004, 0.27), m, (i % 2) * 0.01, 0.004 + i * 0.005, 0).rotation.y = i * 0.12;
      break;
    case 'fita':
      add(new THREE.BoxGeometry(0.1, 0.016, 0.065), m, 0, 0.008);
      add(new THREE.BoxGeometry(0.07, 0.002, 0.03), std({ color: 0xe8c66a }), 0, 0.017);
      break;
    case 'cracha':
      add(new THREE.BoxGeometry(0.06, 0.004, 0.09), std({ color: 0xffffff }), 0, 0.002);
      add(new THREE.BoxGeometry(0.06, 0.005, 0.02), m, 0, 0.004, -0.035);
      break;
    case 'hd':
      add(new THREE.BoxGeometry(0.08, 0.022, 0.12), m, 0, 0.011);
      add(new THREE.BoxGeometry(0.06, 0.001, 0.04), std({ color: 0xfff275 }), 0, 0.023);
      break;
    case 'pendrive':
      add(new THREE.BoxGeometry(0.02, 0.008, 0.06), m, 0, 0.004);
      add(new THREE.BoxGeometry(0.03, 0.002, 0.03), std({ color: 0xc0392b }), 0, 0.009);
      break;
    case 'saco':
      add(new THREE.BoxGeometry(0.16, 0.02, 0.22), std({ color: 0xe8f0ff, transparent: true, opacity: 0.6, roughness: 0.2 }), 0, 0.01);
      add(new THREE.BoxGeometry(0.16, 0.003, 0.03), std({ color: 0xc0392b }), 0, 0.021, -0.09);
      break;
    case 'alicate':
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.02, 0.02, 0.14), m, s * 0.015, 0.01, 0.03).rotation.y = s * 0.12;
      add(new THREE.BoxGeometry(0.04, 0.02, 0.06), std({ color: 0x6a6a72, metalness: 0.8 }), 0, 0.01, -0.07);
      break;
    case 'doce':
      add(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 14), m, 0, 0.015);
      break;
    case 'foto': {
      const moldura = add(new THREE.BoxGeometry(0.16, 0.2, 0.015), m, 0, 0.1);
      moldura.rotation.y = Math.PI / 2;
      moldura.rotation.z = 0.12;
      const foto = add(new THREE.PlaneGeometry(0.12, 0.15), std({ map: texto('#d8c8a8', '#3a2a1a', ['Rui', '&', 'Lena']) }), 0.009, 0.1);
      foto.rotation.y = Math.PI / 2;
      foto.rotation.z = 0.12;
      break;
    }
    default:
      add(new THREE.BoxGeometry(0.12, 0.12, 0.12), m, 0, 0.06);
  }
  void atualiza;
}

/** monta (ou remonta) os enfeites do seu canto do dormitório */
export function montarEnfeites(sala: THREE.Group, tintaCasa: number) {
  sala.getObjectByName('enfeites')?.removeFromParent();
  const velho = sala.userData.enfeitesAnimar as ((dt: number, t: number) => void) | undefined;
  if (velho) M.atualizar.delete(velho);
  const g = new THREE.Group();
  g.name = 'enfeites';
  sala.add(g);
  const madeira = std({ color: 0x5a3a22, roughness: 0.7 });
  // prateleiras e ganchos do seu canto existem mesmo vazios
  for (const y of [1.0, 1.4, 1.8]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 1.05), madeira);
    p.position.set(PAREDE + 0.18, y, -0.95);
    p.castShadow = true;
    p.receiveShadow = true;
    g.add(p);
  }
  for (const z of GANCHOS) {
    const gancho = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), std({ color: 0xb8933e, metalness: 0.8, roughness: 0.3 }));
    gancho.rotation.z = Math.PI / 2;
    gancho.position.set(PAREDE + 0.06, 1.95, z);
    g.add(gancho);
  }
  let s;
  try {
    s = estado();
  } catch {
    return;
  }
  const atualiza: ((t: number) => void)[] = [];
  let ip = 0;
  let ir = 0;
  let io = 0;
  const hexCor = (c: number) => '#' + c.toString(16).padStart(6, '0');
  for (const id of s.enfeites) {
    const d = ENFEITES[id];
    if (!d || !ITENS.has(id)) continue;
    if (d.tipo === 'poster' && ip < POSTERES.length) {
      const [z, y, w] = POSTERES[ip++];
      const tex = texto(d.fundo, d.tinta, d.linhas);
      const moldura = new THREE.Mesh(new THREE.BoxGeometry(0.03, w * 1.25 + 0.06, w + 0.06), std({ color: 0x3a2414, roughness: 0.6 }));
      moldura.position.set(PAREDE + 0.015, y, z);
      g.add(moldura);
      const q = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 1.25), std({ map: tex, roughness: 0.85 }));
      q.position.set(PAREDE + 0.035, y, z);
      q.rotation.y = Math.PI / 2;
      g.add(q);
    } else if (d.tipo === 'roupa' && ir < GANCHOS.length) {
      const z = GANCHOS[ir++];
      const cor = d.fundo === 'casa' ? hexCor(tintaCasa) : d.fundo;
      const r = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), std({ map: roupa(cor, d.tinta, d.linhas), transparent: true, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide }));
      r.position.set(PAREDE + 0.05, 1.6, z);
      r.rotation.y = Math.PI / 2;
      g.add(r);
    } else if (d.tipo === 'luz' && io < LUGARES.length) {
      const [x, y, z] = LUGARES[io++];
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.04, 12), std({ color: 0x2a2a2a }));
      base.position.set(x, y + 0.02, z);
      g.add(base);
      const mat = std({ color: 0x111111, emissive: d.cor!, emissiveIntensity: 1.5 });
      const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), mat);
      cupula.position.set(x, y + 0.12, z);
      g.add(cupula);
      // luz de verdade só no modo de qualidade alta; no leve, só o brilho
      const luz = new THREE.PointLight(d.cor!, 0.8, 2.2, 1.8);
      luz.position.set(x + 0.15, y + 0.15, z);
      if (M.qualidade === 'alta') g.add(luz);
      const f = io;
      // a Pisca-Link pisca, a Cauda Vigilante pulsa a cada "linha de log", a Hexadecimal muda de cor devagar
      atualiza.push((t) => {
        const k = id === 'a2_luminaria_link' ? (Math.sin(t * 6 + f) > 0.6 ? 0.4 : 1.6) : id === 'a3_luminaria_tail' ? 1 + Math.max(0, Math.sin(t * 2.3 + f)) ** 8 * 2 : 1.2 + Math.sin(t * 0.5) * 0.3;
        mat.emissiveIntensity = k;
        luz.intensity = k * 0.5;
      });
    } else if (d.tipo === 'objeto' && io < LUGARES.length) {
      const [x, y, z] = LUGARES[io++];
      objeto(g, d, x, y, z, atualiza);
    }
  }
  const animar = (_dt: number, t: number) => {
    if (!g.parent) {
      M.atualizar.delete(animar);
      return;
    }
    atualiza.forEach((f) => f(t));
  };
  sala.userData.enfeitesAnimar = animar;
  if (atualiza.length) M.atualizar.add(animar);
}
